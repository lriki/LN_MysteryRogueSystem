import { assert } from "ts/mr/Common";
import { DActionId } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";

export type SActivityCommandHandler = (actionId: DActionId) => void;
export type SSystemCommandHandler = (commandId: string) => void;

/**
 * UI のコマンドリストなどに表示するアクションアイテム。
 * QAction のようなもの。
 */
export class SDialogCommand {
    private _displayName: string;
    private _actionId: DActionId;
    private _activityCommandHandler: SActivityCommandHandler | undefined;
    private _systemCommandId: string;
    private _systemCommandIdHandler: SSystemCommandHandler | undefined;

    public static makeActivityCommand(actionId: DActionId, handler: SActivityCommandHandler): SDialogCommand {
        const cmd = new SDialogCommand();
        cmd._displayName = MRData.actions[actionId].displayName;
        cmd._actionId = actionId;
        cmd._activityCommandHandler = handler;
        return cmd;
    }

    public static makeSystemCommand(displayName: string, systemCommandId: string, handler: SSystemCommandHandler): SDialogCommand {
        const cmd = new SDialogCommand();
        cmd._displayName = displayName;
        cmd._systemCommandId = systemCommandId;
        cmd._systemCommandIdHandler = handler;
        return cmd;
    }

    private constructor() {
        this._displayName = "";
        this._actionId = 0;
        this._systemCommandId = "";
    }

    public get displayName(): string {
        return this._displayName;
    }
    
    public get isActivityCommand(): boolean {
        return this._actionId != 0;
    }

    public get actionId(): DActionId {
        return this._actionId;
    }
    
    public get activityCommandHandler(): SActivityCommandHandler {
        assert(this._activityCommandHandler);
        return this._activityCommandHandler;
    }

    public get isSystemCommand(): boolean {
        return this._systemCommandId.length > 0;
    }

    public get systemCommandId(): string {
        return this._systemCommandId;
    }

    public get systemCommandIdHandler(): SSystemCommandHandler {
        assert(this._systemCommandIdHandler);
        return this._systemCommandIdHandler;
    }

    public execute(): void {
        if (this._activityCommandHandler) {
            this._activityCommandHandler(this._actionId);
        }
        else if (this._systemCommandIdHandler) {
            this._systemCommandIdHandler(this._systemCommandId);
        }
        else {
            throw new Error("Unreachable.");
        }
    }
}

