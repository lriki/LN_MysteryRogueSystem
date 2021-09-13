import { tr2 } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DPrefabImage } from "ts/re/data/DPrefab";
import { DStateRestriction } from "ts/re/data/DState";
import { REData } from "ts/re/data/REData";
import { REGame } from "ts/re/objects/REGame";
import { LIllusionStateBehavior } from "ts/re/objects/states/LIllusionStateBehavior";
import { DTraits } from "../data/DTraits";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { LNameView } from "../objects/internal";
import { LEntity } from "../objects/LEntity";

export interface TilemapViewInfo {
    visible: boolean;
    tilesetId: number | undefined;
}

export interface SEntityVisibility {
    visible: boolean;
    translucent: boolean;
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
            
            if (entity.findEntityBehavior(LUnitBehavior)) {
                if (subject.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                    return {
                        name: tr2("なにものか"),
                        iconIndex: 0,
                        upgrades: 0,
                    };
                }
    
                // まどわし状態
                if (subject.collectBehaviors().find(s => s instanceof LIllusionStateBehavior)) {
                    return {
                        name: tr2("？？？"),
                        iconIndex: 0,
                        upgrades: 0,
                    };
                }
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
            // entity は操作中キャラ以外
            
            // 目つぶし状態
            if (subject.states().find(s => s.stateData().restriction == DStateRestriction.Blind)) {
                return { visible: false, translucent: false };
            }
            
            // 透明状態
            if (entity.traits(DTraits.Invisible).length > 0) {
                return { visible: false, translucent: false };
            }

            if (subject.collectBehaviors().find(s => s instanceof LIllusionStateBehavior)) {
                if (entity.findEntityBehavior(LUnitBehavior)) {
                    return { visible: true, translucent: false, image: REData.prefabs[DBasics.prefabs.illusionActor].image };
                }
                else {
                    return { visible: true, translucent: false, image: REData.prefabs[DBasics.prefabs.illusionItem].image };
                }
            }
        }
        else {
            // entity は操作中キャラ

            // 透明状態
            if (entity.traits(DTraits.Invisible).length > 0) {
                return { visible: true, translucent: true };
            }
        }

        return { visible: true, translucent: false };
    }
}
