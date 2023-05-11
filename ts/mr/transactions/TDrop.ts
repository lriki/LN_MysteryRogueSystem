import { assert, tr2 } from "../Common";
import { MRBasics } from "../data/MRBasics";
import { LEntity } from "../lively/entity/LEntity";
import { LInventoryBehavior } from "../lively/entity/LInventoryBehavior";
import { MRLively } from "../lively/MRLively";
import { SCommandContext } from "../system/SCommandContext";
import { ULimitations } from "../utility/ULimitations";
import { UMovement } from "../utility/UMovement";
import { UName } from "../utility/UName";

export class TDrop {
    private _items: LEntity[];// | undefined;
    // private _inventory: LInventoryBehavior | undefined;
    private _mx: number | undefined;
    private _my: number | undefined;

    public static makeFromSingleItem(item: LEntity): TDrop {
        const t = new TDrop();
        t._items = [item];
        return t;
    }

    public static makeFromEntityInventory(inventoryOwner: LEntity): TDrop {
        const t = new TDrop();
        const inventory = inventoryOwner.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            t._items = inventory.items;
        }
        return t;
    }
    
    public constructor() {
        this._items = [];
    }

    public withLocation(mx: number, my: number): this {
        this._mx = mx;
        this._my = my;
        return this;
    }

    public testValidEffect(): boolean {
        return this._items.length > 0;
    }

    public performe(cctx: SCommandContext): void {
        for (const item of this._items) {
            const mx = this._mx ?? item.mx;
            const my = this._my ?? item.my;
            this.performeSingleItem(cctx, item, mx, my);
        }
    }

    private performeSingleItem(cctx: SCommandContext, item: LEntity, mx: number, my: number): void {
        TDrop.dropOrDestroyEntityForce(cctx, item, mx, my)
    }

    /**
     * entity を現在位置から HomeLayer へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     * entity がその場所から取り出せるかはテストしない。
     * 
     * @param cctx 
     * @param item 
     */
    public static dropOrDestroyEntityForce(cctx: SCommandContext, item: LEntity, mx: number, my: number): void {
        const map = MRLively.mapView.currentMap;

        item.removeFromParent();
        MRLively.world.transferEntity(item, map.floorId(), mx, my);

        if (ULimitations.isItemCountFullyInMap()) {

        }
        else {
            const targetLayer = item.getHomeLayer();
            const block = UMovement.selectNearbyLocatableBlock(item.map, cctx.random(), item.mx, item.my, targetLayer, item);
            if (block) {
                item.map.locateEntity(item, block.mx, block.my, targetLayer);
                cctx.postSequel(item, MRBasics.sequels.dropSequel);
                return;
            }
        }

        // 落下できるところが無ければ Entity 削除
        cctx.postMessage(tr2("%1は消えてしまった…。").format(UName.makeNameAsItem(item)));
        cctx.postDestroy(item);
    }
}
