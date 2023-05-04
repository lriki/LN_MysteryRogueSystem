import { assert } from "../Common";
import { DBlockLayerKind } from "../data/DCommon";
import { MRBasics } from "../data/MRBasics";
import { LEntity } from "../lively/entity/LEntity";
import { MRLively } from "../lively/MRLively";
import { LEquipmentUserBehavior } from "../lively/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "../lively/entity/LInventoryBehavior";
import { LGenerateDropItemCause } from "../lively/internal";
import { SSprinkleDropedCommand } from "../system/SCommand";
import { SCommandContext } from "../system/SCommandContext";
import { UAction } from "../utility/UAction";
import { SPoint } from "../utility/UCommon";

/**
 * [転倒] に関する処理。
 * 
 * 
 * 
 */
export class TStumble {

    
    /*  ⑦⑤④
        ②①⑥
        Ｐ③⑧
    */
        private static StumbleTable: SPoint[][] = [
            [],
            
            // ⑧③Ｐ
            // ⑥①②
            // ④⑤⑦
            [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: -2, y: 2 }, { x: -1, y: 2 }, { x: -2, y: 1 }, { x: 0 , y: 2 }, { x: -2 , y: 0 }],
    
            //     Ｐ
            //   ③①②
            // ⑧⑥④⑤⑦
            [{ x: 0, y: 1 }, { x: 1, y: 1}, { x: -1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 2, y: 2 }, { x: -2, y: 2 }],
            
            // Ｐ②⑦
            // ③①⑤
            // ⑧⑥④
            [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 0, y: 2 }],
    
            // ⑧
            // ⑥③
            // ④①Ｐ
            // ⑤②
            // ⑦
            [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 }, { x: -2, y: -1 }, { x: -2, y: -2 }, { x: -2, y: 2 }],
    
            [],
    
            //     ⑦
            //   ②⑤
            // Ｐ①④
            //   ③⑥
            //     ⑧
            [{ x: 1, y: 0 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: 2, y: -2 }, { x: 2, y: 2 }],
    
            // ④⑥⑧
            // ⑤①③
            // ⑦②Ｐ
            [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: -2, y: -2 }, { x: -2, y: -1 }, { x: -1, y: -2 }, { x: -2, y: 0 }, { x: 0, y: -2 }],
    
            // ⑦⑤④⑥⑧
            //   ②①③
            //     Ｐ
            [{ x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: -2 }, { x: -1, y: -2 }, { x: 1, y: -2 }, { x: -2, y: -2 }, { x: 2, y: -2 }],
    
            // ⑦⑤④
            // ②①⑥
            // Ｐ③⑧
            [{ x: 1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 2, y: -2 }, { x: 1, y: -2 }, { x: 2, y: -1 }, { x: 0, y: -2 }, { x: 2, y: 0 }],
        ];

        
    /**
     * 転倒し、アイテムをばらまく。
     * ダメージは入らないので注意。
     * 罠や杖による転倒は微ダメージだが、モンスターのスキルで転倒したときはより大きいダメージが発生するケースもあるため、ここではダメージ処理は行わない。
     */
    public static postStumble(cctx: SCommandContext, entity: LEntity, dir: number): void {
        if (entity.isPlayer())
            this.postStumbleForPlayer(cctx, entity, dir);
        else
            this.postStumbleForNPC(cctx, entity);
        cctx.postSequel(entity, MRBasics.sequels.stumble);
    }

    /** 操作中 Unit 用の転倒時アイテムバラまき。インベントリからランダムに選択されたアイテムを、足元ではなく前方にバラまく。 */
    private static postStumbleForPlayer(cctx: SCommandContext, entity: LEntity, dir: number): void {
        
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            const items = this.getDefenselessInventoryItems(entity);

            
            const positions = this.StumbleTable[dir];
            assert(positions.length > 0);
            const loops = Math.min(items.length, positions.length);
            let iItem = 0;
            for (let i = 0; i < positions.length && iItem < items.length; i++) {
                const mx = entity.mx + positions[i].x;
                const my = entity.my + positions[i].y;

                // 地形などを考慮して、本当に落とすアイテムを決める
                const block = MRLively.mapView.currentMap.tryGetBlock(mx, my);
                if (block && block.isFloorLikeShape() && !block.layer(DBlockLayerKind.Ground).isContainsAnyEntity()) {
                    const item = items[iItem];
                    item.removeFromParent();
                    MRLively.world.transferEntity(item, MRLively.mapView.currentMap.floorId(), entity.mx, entity.my);
                    cctx.postTransferFloor(item, MRLively.mapView.currentMap.floorId(), mx, my);
                    cctx.postSequel(item, MRBasics.sequels.jump);
                    cctx.postCommandTask(new SSprinkleDropedCommand(item));

                    iItem++;
                }
            }
        }
    }

    private static postStumbleForNPC(cctx: SCommandContext, entity: LEntity): void {
        this.postDropItems(cctx, entity, LGenerateDropItemCause.Stumble);
    }

    public static postDropItems(cctx: SCommandContext, entity: LEntity, cause: LGenerateDropItemCause): void {
        const map = MRLively.mapView.currentMap;
        assert(map.checkAppearing(entity));
        const items = entity.generateDropItems(cause);
        for (const item of items) {
            UAction.postDropOrDestroy(cctx, item, entity.mx, entity.my);
        }
    }
    
    public static getDefenselessInventoryItems(entity: LEntity): readonly LEntity[] {
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        const equipmentUser = entity.findEntityBehavior(LEquipmentUserBehavior);
        if (!inventory) return [];
        
        if (equipmentUser) {
            return inventory.items.filter(x => !equipmentUser.isEquipped(x));
        }
        else {
            return inventory.items;
        }
    }

}

