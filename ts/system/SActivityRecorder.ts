
import * as fs from 'fs';
import { assert } from 'ts/Common';
import { DActionId } from 'ts/data/DAction';
import { SActivityPlaybackDialog } from 'ts/system/dialogs/SActivityPlaybackDialog';
import { LEntityId } from 'ts/objects/LObject';
import { REGame } from 'ts/objects/REGame';
import { LMap } from 'ts/objects/LMap';
import { RESystem } from './RESystem';
import { LActivity, LActivityData } from 'ts/objects/activities/LActivity';
import { RmmzStorageManager } from 'ts/rmmz/StorageManager';

export enum ActivityRecordingCommandType {
    Activity = 1,
    CloseMainDialog = 2,    // CommandChain 内部から Open された Dialog が Close されたとき。
}

export interface ActivityRecordingCommand {
    type: ActivityRecordingCommandType,
    activity: LActivityData | null,
}

enum RecorderMode {
    Idle,
    Recording,
    Playback,
}

export class SActivityRecorder {
    private _recorderMode: RecorderMode = RecorderMode.Idle;
    private _stream: fs.WriteStream | undefined;
    private _playbackCommands: ActivityRecordingCommand[] | undefined;
    private _playbackCommandIndex: number = 0;
    private _savefileId: number = 0;
    private _silentPlayback: boolean = false;
    
    constructor() {
    }

    public setSavefileId(id: number): void {
        this._savefileId = id;
    }

    public isIdle(): boolean {
        return this._recorderMode == RecorderMode.Idle;
    }

    public isRecording(): boolean {
        return this._recorderMode == RecorderMode.Recording;
    }

    public isPlayback(): boolean {
        return this._recorderMode == RecorderMode.Playback;
        //return this._playbackCommands != undefined && this._playbackCommandIndex < this._playbackCommands.length;
    }

    public checkPlaybackRemaining(count: number): boolean {
        assert(this._playbackCommands);
        return (this._playbackCommands.length - this._playbackCommandIndex) <= count;
    }

    public startRecording(): Promise<boolean> {
        this.closeFile();

        this._recorderMode = RecorderMode.Recording;

        return new Promise(async (resolve, reject) => {
            this._stream = fs.createWriteStream(this.filePath());
            this._stream.on('open', () => resolve(true));
            this._stream.on('error', () => reject(false));
        });

        /*
        this._stream = fs.createWriteStream(this.filePath());
        assert(this._stream);
        this._stream.on('open', () => {
            console.log("createReadStream");
        });
        this._stream.on('ready', () => {
            console.log("2");
        });
        this._stream.on('finish', () => {
            console.log("3");
        });
        */
    }
    
    public stopRecording(): Promise<boolean> {

        if (this._stream) {
            this._stream.close();
            this._recorderMode = RecorderMode.Idle;
    
            
        }
        
        return new Promise(async (resolve, reject) => {
            if (this._stream) {
                this._stream.on('close', () => resolve(true));
            }
        });
    }

    public restartRecording(): void {
        this.closeFile();

        const options = {
            flags: "a"  // 追加書き込みモード
        };
        this._stream = fs.createWriteStream(this.filePath(), options);
        this._recorderMode = RecorderMode.Recording;
    }

    private filePath(): string {
        //const dir = RESystem.unittest ? "" : RmmzStorageManager.fileDirectoryPath();
        const dir = RmmzStorageManager.fileDirectoryPath();
        return (dir + `re${this._savefileId}.resave`).replace(/\\/g, "/");
    }

    public push(cmd: ActivityRecordingCommand): void {
        assert(this._stream);

        // 平均実行時間は 0.02[ms]
        this._stream.write(JSON.stringify(cmd) + ",\n");
    }

    public attemptStartPlayback(silent: boolean): boolean {
        this.closeFile();

        const filepath = this.filePath();
        
        if (!fs.existsSync(filepath)) {
            // ファイルが無かった。実行不要。
            return false;
        }

        const data = fs.readFileSync(filepath, { encoding: "utf8" });
        const json = "[" + data.substring(0, data.length - 2) + "]";
        this._playbackCommands = JSON.parse(json);
        
        if (!this._playbackCommands || this._playbackCommands.length == 0) {
            // ファイルが空っぽだった。実行不要。
            return false;
        }

        this._playbackCommandIndex = 0;
        this._recorderMode = RecorderMode.Playback;
        this._silentPlayback = silent;
        return true;
    }

    public clearSilentPlayback(): void {
        this._silentPlayback = false;
    }

    public isSilentPlayback(): boolean {
        return this._silentPlayback;
    }

    private closeFile(): void {
        if (this._stream) {
            this._stream.close();
            this._stream = undefined;
        }
    }

    public runPlaybackCommand(dialog: SActivityPlaybackDialog): boolean {
        assert(this._playbackCommands);
        assert(this.isPlayback());

        // DialogClose まで一気に実行する
        do {
            const cmd = this._playbackCommands[this._playbackCommandIndex];
            this._playbackCommandIndex++;

            if (!this.doCommand(dialog, cmd)) {
                break;
            }

        } while (this._playbackCommandIndex < this._playbackCommands.length);

        if (this._playbackCommandIndex < this._playbackCommands.length) {
            return true;
        }
        else {
            this._recorderMode == RecorderMode.Idle;
            //this._silentPlayback = false;
            return false;
        }
    }

    private doCommand(dialog: SActivityPlaybackDialog, cmd: ActivityRecordingCommand): boolean {
        switch (cmd.type) {
            case ActivityRecordingCommandType.Activity: {
                assert(cmd.activity);
                RESystem.commandContext.postActivity(LActivity.makeFromData(cmd.activity));
                return true;
            }
            case ActivityRecordingCommandType.CloseMainDialog: {
                return false;
            }
            default:
                throw new Error("Unreachable.");
                break;
        }

        /*
        switch (cmd.type) {
            case RERecordingCommandType.Action: {
                const actionId: number = cmd.data.actionId;
                const actorEntityId = new LEntityId(cmd.data.actorEntityId._index, cmd.data.actorEntityId._key);
                const args: any = cmd.data.args;
                RESystem.commandContext.postActionOneWay(actionId, REGame.world.entity(actorEntityId), undefined, undefined, args);
                return true;
            }
            case RERecordingCommandType.ConsumeActionToken: {
                const id = new LEntityId(cmd.data.entityId._index, cmd.data.entityId._key);

                const causeEntity = RESystem.dialogContext.causeEntity();
                console.log("id", id);
                assert(causeEntity);
                console.log("causeEntity.entityId()", causeEntity.entityId());
                console.log("id.equals(causeEntity.entityId())", id.equals(causeEntity.entityId()));
                assert(id.equals(causeEntity.entityId()));

                RESystem.commandContext.postConsumeActionToken(REGame.world.entity(id));
                dialog.consumeAction(); // TODO:
                dialog.submit(); // TODO:
                return false;
            }
            default:
                throw new Error();
                break;
        }
        */
    }
}
