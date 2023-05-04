import { LEntity } from "ts/mr/lively/entity/LEntity";
import { SDialog } from "ts/mr/system/SDialog";
import { SDialogContext } from "ts/mr/system/SDialogContext";


export class SEventExecutionDialog extends SDialog {
    public readonly owner: LEntity;
    public readonly player: LEntity;
    private _rmmzEventId: number;

    billingPrice: number;
    depositPrice: number;

    constructor(rmmzEventId: number, owner: LEntity, player: LEntity) {
        super();
        this.owner = owner;
        this.player = player;
        this._rmmzEventId = rmmzEventId;
        this.billingPrice = 0;
        this.depositPrice = 0;
    }

    /** @deprecated */
    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    public get rmmzEvent(): Game_Event | undefined {
        const spawner = this.owner.getUniqueSpawner();
        if (!spawner) return undefined;
        if (spawner.overrideRmmzEventMapId != $gameMap.mapId()) return undefined;
        return $gameMap.event(spawner.overrideRmmzEventId);
    }
}

