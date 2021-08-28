import { tr2 } from "ts/Common";
import { DPrefabImage } from "ts/data/DPrefab";
import { DStateRestriction } from "ts/data/DState";
import { REGame } from "ts/objects/REGame";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { LNameView } from "../objects/internal";
import { LEntity } from "../objects/LEntity";

export interface TilemapViewInfo {
    visible: boolean;
    tilesetId: number | undefined;
}

export interface SEntityVisibility {
    visible: boolean;
    image?: DPrefabImage;
}

/**
 * 試験運用中。
 * 
 * すべて Behavior で賄おうとしていたが、パフォーマンスの影響と複雑化を考慮し、
 * ボトムアップだけの方法ではなくトップダウンで固有の機能を実現する手段を入れてみる。
 */
export class SView {
    // subject から見た entity はどのように見えるのか？
    public static getLookNames(subject: LEntity, entity: LEntity): LNameView {
        if (!subject.entityId().equals(entity.entityId())) {
                    
            if (entity.findBehavior(LUnitBehavior) &&
                subject.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                return {
                    name: tr2("なにものか"),
                    iconIndex: 0,
                    upgrades: 0,
                };
            }
        }

        return entity.getDisplayName();
    }

    public static getTilemapView(): TilemapViewInfo {
        const subject = REGame.camera.focusedEntity();
        if (subject) {
            
            if (subject.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                return {
                    visible: false,
                    tilesetId: 0,
                };
            }
        }

        return { visible: true, tilesetId: undefined };
    }
    
    public static getEntityVisibility(entity: LEntity): SEntityVisibility {
        const subject = REGame.camera.focusedEntity();
        if (subject && !subject.entityId().equals(entity.entityId())) {
            
            if (subject.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                return { visible: false };
            }
        }

        return { visible: true };
    }
}
