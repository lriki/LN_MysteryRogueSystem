import { tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DPrefabActualImage } from "ts/re/data/DPrefab";
import { DStateRestriction } from "ts/re/data/DState";
import { REData } from "ts/re/data/REData";
import { REGame } from "ts/re/objects/REGame";
import { LIllusionStateBehavior } from "ts/re/objects/states/LIllusionStateBehavior";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { LNameView } from "../objects/internal";
import { LEntity } from "../objects/LEntity";
import { LTrapBehavior } from "../objects/behaviors/LTrapBehavior";
import { USearch } from "../usecases/USearch";

export interface TilemapViewInfo {
    visible: boolean;
    tilesetId: number | undefined;
}

export interface SEntityVisibility {
    visible: boolean;
    translucent: boolean;   // 操作中キャラが透明状態 = 半透明で表示するか
    image?: DPrefabActualImage;
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
                if (subject.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind)) {
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
            
            if (subject.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind)) {
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

        // if (!entity.floorId.equals(REGame.map.floorId())) {
        //     return { visible: false, translucent: false };
        // }

        if (subject && !subject.entityId().equals(entity.entityId())) {
            // entity は操作中キャラ以外
            
            // subject が目つぶし状態なら見えない
            if (subject.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind)) {
                return { visible: false, translucent: false };
            }
            
            // entity が透明状態なら見えない
            //if (entity.traits(REBasics.traits.Invisible).length > 0) {
            if (!USearch.isVisibleFromSubject(subject, entity)) {
                return { visible: false, translucent: false };
            }

            // entity が露出していない罠なら見えない
            const trap = entity.findEntityBehavior(LTrapBehavior);
            if (trap) {
                if (!trap.exposed()) {
                    return { visible: false, translucent: false };
                }
            }

            if (subject.collectBehaviors().find(s => s instanceof LIllusionStateBehavior)) {
                if (entity.findEntityBehavior(LUnitBehavior)) {
                    return { visible: true, translucent: false, image: REData.prefabs[REBasics.prefabs.illusionActor].image };
                }
                else {
                    return { visible: true, translucent: false, image: REData.prefabs[REBasics.prefabs.illusionItem].image };
                }
            }
        }
        else {
            // entity は操作中キャラ

            // 透明状態
            if (entity.traits(REBasics.traits.Invisible).length > 0) {
                return { visible: true, translucent: true };
            }
        }

        return { visible: true, translucent: false };
    }
}
