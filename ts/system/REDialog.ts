
import { assert } from "ts/Common";
import { RECommand, REResponse } from "./RECommand";
import { RECommandContext } from "./RECommandContext";
import { REScheduler } from "./REScheduler";

export class REDialogContext
{
    private _owner: REScheduler;
    private _commandContext: RECommandContext;
    private _dialogModel: REDialog | null;

    constructor(owner: REScheduler, commandContext: RECommandContext) {
        this._owner = owner;
        this._commandContext = commandContext;
        this._dialogModel = null;
    }

    dialog(): REDialog {
        if (this._dialogModel)
            return this._dialogModel;
        else
            throw new Error("_dialogModel");
    }

    commandContext(): RECommandContext {
        return this._commandContext;
    }

    closeDialog() {
        this._owner._closeDialogModel();
    }

    _setDialogModel(value: REDialog | null) {
        this._dialogModel = value;
    }

    _hasDialogModel(): boolean {
        return this._dialogModel !== null;
    }

    _update() {
        assert(this._dialogModel !== null);
        this._dialogModel.onUpdate(this);
    }
}


/**
 * GameDialog
 *
 * Dialog と名前がついているが、必ずしも UI を持つものではない。
 * 名前通り、エンドユーザーとの「対話」のためのインターフェイスを実装する。
 */
export class REDialog
{
    onUpdate(context: REDialogContext): void { }
}
