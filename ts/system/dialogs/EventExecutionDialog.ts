import { SDialog } from "ts/system/SDialog";
import { SDialogContext } from "ts/system/SDialogContext";


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

