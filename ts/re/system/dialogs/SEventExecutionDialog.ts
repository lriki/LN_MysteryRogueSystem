import { LEntity } from "ts/re/objects/LEntity";
import { SDialog } from "ts/re/system/SDialog";
import { SDialogContext } from "ts/re/system/SDialogContext";


export class SEventExecutionDialog extends SDialog {
    private _rmmzEventId: number;

    billingPrice: number;
    depositPrice: number;
    owner: LEntity;

    constructor(rmmzEventId: number, owner: LEntity) {
        super();
        this._rmmzEventId = rmmzEventId;
        this.billingPrice = 0;
        this.depositPrice = 0;
        this.owner = owner;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    onUpdate(context: SDialogContext): void {
    }
}
