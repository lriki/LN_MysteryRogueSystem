import { DActionId } from "ts/re/data/DAction";


/**
 * UI のコマンドリストなどに表示するアクションアイテム。
 * QAction のようなもの。
 */
export class SDialogCommand {
    private _actionId: DActionId;
    private _systemCommandName: string;

    public static makeActivityCommand(actionId: DActionId): SDialogCommand {
        const i = new SDialogCommand();
        i._actionId = actionId;
        return i;
    }

    public static makeSystemCommand(systemCommandName: string): SDialogCommand {
        const i = new SDialogCommand();
        i._systemCommandName = systemCommandName;
        return i;
    }

    private constructor() {
        this._actionId = 0;
        this._systemCommandName = "";
    }

    public get isActivityCommand(): boolean {
        return this._actionId != 0;
    }

    public get actionId(): DActionId {
        return this._actionId;
    }

    public get isSystemCommand(): boolean {
        return this._systemCommandName.length > 0;
    }

    public get systemCommandName(): string {
        return this._systemCommandName;
    }
}

