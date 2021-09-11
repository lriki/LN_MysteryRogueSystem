import { SDialog } from "ts/re/system/SDialog";
import { SDialogContext } from "ts/re/system/SDialogContext";


export class SEventExecutionDialog extends SDialog {
    private _rmmzEventId: number;

    constructor(rmmzEventId: number) {
        super();
        this._rmmzEventId = rmmzEventId;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    onUpdate(context: SDialogContext): void {
    }
}

