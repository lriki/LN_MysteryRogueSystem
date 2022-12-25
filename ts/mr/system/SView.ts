import { assert, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DPrefabActualImage } from "ts/mr/data/DPrefab";
import { DStateRestriction } from "ts/mr/data/DState";
import { MRData } from "ts/mr/data/MRData";
import { MRLively } from "ts/mr/lively/MRLively";
import { LIllusionStateBehavior } from "ts/mr/lively/states/LIllusionStateBehavior";
import { LUnitBehavior } from "../lively/behaviors/LUnitBehavior";
import { LNameView } from "../lively/internal";
import { LEntity } from "../lively/LEntity";
import { LTrapBehavior } from "../lively/behaviors/LTrapBehavior";
import { USearch } from "../utility/USearch";
import { Helpers } from "./Helpers";
import { LExitPointBehavior } from "../lively/behaviors/LExitPointBehavior";

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
        const subject = MRLively.mapView.focusedEntity();
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

    public static getMinimapVisibility(entity: LEntity): SEntityVisibility {
        const subject = MRLively.mapView.focusedEntity();

        // if (!entity.floorId.equals(REGame.map.floorId())) {
        //     return { visible: false, translucent: false };
        // }

        if (subject && !subject.entityId().equals(entity.entityId())) {
            // entity は操作中キャラ以外
            
            // // subject が目つぶし状態なら見えない
            // if (subject.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind)) {
            //     return { visible: false, translucent: false };
            // }
            
            // // entity が透明状態なら見えない
            // //if (entity.traits(REBasics.traits.Invisible).length > 0) {
            // if (!USearch.isVisibleFromSubject(subject, entity)) {
            //     return { visible: false, translucent: false };
            // }

            // // entity が露出していない罠なら見えない
            // const trap = entity.findEntityBehavior(LTrapBehavior);
            // if (trap) {
            //     if (!trap.isExposedFor(subject)) {
            //         return { visible: false, translucent: false };
            //     }
            // }

            // 見えないものを先にはじく
            if (this.checkEntityInvisible(subject, entity)) {
                return { visible: false, translucent: false };
            }

            // 次に見えるべきをチェック
            if (!this.checkEntityVisible(subject, entity)) {
                return { visible: false, translucent: false };
            }

            // if (!Helpers.isHostile(subject, entity)) {
            //     const targetBlock = REGame.map.block(entity.mx, entity.my);

            //     // 中立 target は、踏破済みの Block 上なら見える
            //     if (!targetBlock._passed) {
            //         return { visible: false, translucent: false };
            //     }
            // }
            // else if (UMovement.checkAdjacentEntities(subject, entity)) {
            //     // 隣接している相手は、基本的に見える
            // }
            // else {
            //     // 部屋内？
            //     if (subject.isOnRoom()) {
            //         if (subject.roomId() != entity.roomId()) {
            //             return { visible: false, translucent: false };
            //         }
            //     }
            //     else {
            //     }
            // }


            // subject が惑わし状態？
            if (subject.collectBehaviors().find(s => s instanceof LIllusionStateBehavior)) {
                if (entity.findEntityBehavior(LUnitBehavior)) {
                    return { visible: true, translucent: false, image: MRData.prefabs[MRBasics.prefabs.illusionActor].image };
                }
                else {
                    return { visible: true, translucent: false, image: MRData.prefabs[MRBasics.prefabs.illusionItem].image };
                }
            }
        }
        else {
            // entity は操作中キャラ (自分自身は基本的に見える)

            // 透明状態
            if (entity.traits(MRBasics.traits.Invisible).length > 0) {
                return { visible: true, translucent: true };
            }
        }

        return { visible: true, translucent: false };
    }
    
    /**
     * subject から entity が可視であるか。
     * 
     * 基本的にプレイヤーから見た視界の表示で使用する。
     * AI 用の視界判定処理とは微妙に異なるので注意。
     * 例えば、部屋の外であっても、一度通過したブロックにあるアイテムは可視である。
     * 
     * ミニマップの処理とも微妙に違う点に注意。
     * 影無しフロアでは、ミニマップには表示されないが、タイルマップ上に表示されるものもある。
     * つまり、基本的にミニマップ表示判定よりもタイルマップ表示判定の方が強い。
     */
    public static getEntityVisibility(entity: LEntity): SEntityVisibility {
        return this.getMinimapVisibility(entity);
    }

    /** 見えなくなる条件をチェックする */
    private static checkEntityInvisible(subject: LEntity, target: LEntity): boolean {
        // 自分自身は常に見える
        //if (subject.entityId().equals(target.entityId())) return true;

        // subject が目つぶし状態なら見えない
        if (USearch.hasBlindness(subject)) return true;

        // target が透明状態
        if (!USearch.isVisibleFromSubject(subject, target)) return true;

        // target が露出していない罠なら見えない
        const trap = target.findEntityBehavior(LTrapBehavior);
        if (trap) {
            if (!trap.isExposedFor(subject)) {
                return true;
            }
        }

        // 見える
        return false;
    }
    
    /** 見える条件をチェックする */
    private static checkEntityVisible(subject: LEntity, target: LEntity): boolean {
        // 自分自身は常に見える
        //if (subject.entityId().equals(target.entityId())) return true;

        //if (REGame.map.unitClarity) return true;
        const map = MRLively.mapView.currentMap;

        // あかりの巻物など、フロア自体に可視効果がある
        if (map.unitClarity) {
            if (target.isUnit()) {
                return true;
            }
        }

        if (map.itemClarity) {
            if (this.isItem(target)) {
                return true;
            }
        }


        // 味方は常に視認可能
        if (Helpers.isFriend(subject, target)) {
            return true;
        }
        
        // 中立 target は、踏破済みの Block 上なら見える
        if (!Helpers.isHostile(subject, target)) {
            const targetBlock = MRLively.mapView.currentMap.block(target.mx, target.my);
            if (targetBlock._passed) {
                return true;
            }
        }

        // 地形やマップの状態的に見える
        if (USearch.checkInSightEntity(subject, target)) {
            return true;
        }

        // 見えない
        return false;
    }
    

    private static isItem(entity: LEntity): boolean {
        if (!!entity.data.itemData) {
            if (!entity.findEntityBehavior(LExitPointBehavior)) {
                return true;
            }
        }
        return false;
    }
}
