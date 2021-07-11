
import * as fs from 'fs';
import { assert } from 'ts/Common';
import { DActionId } from 'ts/data/DAction';
import { SCommandPlaybackDialog } from 'ts/system/dialogs/SCommandPlaybackDialog';
import { LEntityId } from 'ts/objects/LObject';
import { REGame } from 'ts/objects/REGame';
import { LMap } from 'ts/objects/LMap';
import { RECommand } from './RECommand';
import { RESystem } from './RESystem';

export enum RERecordingCommandType {
    Action = 1,
    Sequel = 2,
    ConsumeActionToken = 3,
}

export interface RERecordingCommand {
    type: RERecordingCommandType,
    data: any,
}

export interface RERecordingCommandArgs_Action {
    actionId: DActionId,
    actorEntityId: LEntityId,
    reactorEntityId: LEntityId,
    args: any,
}

export class RECommandRecorder {
    private _stream: fs.WriteStream | undefined;
    private _playbackCommands: RERecordingCommand[] | undefined;
    private _playbackCommandIndex: number = 0;
    
    constructor() {
        this.startRecording();
        //this.startPlayback();
    }

    public isRecording(): boolean {
        return this._stream != undefined;
    }

    public isPlayback(): boolean {
        return this._playbackCommands != undefined && this._playbackCommandIndex < this._playbackCommands.length;
    }

    public startRecording(): void {
        this._stream = fs.createWriteStream("test.txt");
    }

    public push(cmd: RERecordingCommand): void {
        assert(this._stream);

        // 平均実行時間は 0.02[ms]
        this._stream.write(JSON.stringify(cmd) + ",\n");
    }

    public startPlayback(): void {
        const data = fs.readFileSync("test.txt", { encoding: "utf8" });
        const json = "[" + data.substring(0, data.length - 2) + "]";

        this._playbackCommands = JSON.parse(json);
        console.log("_playbackCommands", this._playbackCommands);
        this._playbackCommandIndex = 0;
    }

    public runPlaybackCommand(dialog: SCommandPlaybackDialog): void {
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
    }

    private doCommand(dialog: SCommandPlaybackDialog, cmd: RERecordingCommand): boolean {
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
    }
}
