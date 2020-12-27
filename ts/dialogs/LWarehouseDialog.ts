import { REDialog, REDialogContext } from "../system/REDialog";

export class LWarehouseDialog extends REDialog {
    private _warehouseActorId: number;

    public constructor(warehouseActorId: number) {
        super();
        this._warehouseActorId = warehouseActorId;
    }

    public warehouseActorId(): number {
        return this._warehouseActorId;
    }
}
