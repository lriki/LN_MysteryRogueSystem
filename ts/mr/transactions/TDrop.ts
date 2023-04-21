import { tr2 } from "../Common";
import { MRBasics } from "../data/MRBasics";
import { LEntity } from "../lively/LEntity";
import { MRLively } from "../lively/MRLively";
import { SCommandContext } from "../system/SCommandContext";
import { ULimitations } from "../utility/ULimitations";
import { UMovement } from "../utility/UMovement";
import { UName } from "../utility/UName";

export class TDrop {

    /**
     * entity を現在位置から HomeLayer へ落とす。"Fall" ではないため、これによって罠が発動したりすることは無い。
     * 
     * entity がその場所から取り出せるかはテストしない。
     * 
     * @param cctx 
     * @param entity 
     */
    public static dropOrDestroyEntityForce(cctx: SCommandContext, entity: LEntity, mx: number, my: number): void {
        const map = MRLively.mapView.currentMap;

        entity.removeFromParent();
        MRLively.world.transferEntity(entity, map.floorId(), mx, my);

        if (ULimitations.isItemCountFullyInMap()) {

        }
        else {
            const targetLayer = entity.getHomeLayer();
            const block = UMovement.selectNearbyLocatableBlock(entity.map, cctx.random(), entity.mx, entity.my, targetLayer, entity);
            if (block) {
                entity.map.locateEntity(entity, block.mx, block.my, targetLayer);
                cctx.postSequel(entity, MRBasics.sequels.dropSequel);
                return;
            }
        }

        // 落下できるところが無ければ Entity 削除
        cctx.postMessage(tr2("%1は消えてしまった…。").format(UName.makeNameAsItem(entity)));
        cctx.postDestroy(entity);
    }
}
