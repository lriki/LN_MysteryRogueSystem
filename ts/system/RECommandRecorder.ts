
import * as fs from 'fs';
import { assert } from 'ts/Common';
import { ActionId } from 'ts/data/REData';
import { LEntityId } from 'ts/objects/LObject';
import { RECommand } from './RECommand';

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
    actionId: ActionId,
    actorEntityId: LEntityId,
    reactorEntityId: LEntityId,
    args: any,
}

export class RECommandRecorder {
    private _stream: fs.WriteStream;
    _recording: boolean = true;
    
    constructor() {
        this._stream = fs.createWriteStream("test.txt");
    }

    isRecording(): boolean {
        return this._recording;
    }

    push(cmd: RERecordingCommand): void {
        assert(this._recording);
        this._stream.write(JSON.stringify(cmd) + "\n");
    }
}
