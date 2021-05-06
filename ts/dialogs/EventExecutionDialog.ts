import { REDialog } from "ts/system/REDialog";
import { REDialogContext } from "ts/system/SDialogContext";


export class REEventExecutionDialog extends REDialog {
    private _rmmzEventId: number;

    constructor(rmmzEventId: number) {
        super();
        this._rmmzEventId = rmmzEventId;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    onUpdate(context: REDialogContext): void {
    }
}

