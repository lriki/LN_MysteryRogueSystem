import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { REGame } from "ts/mr/lively/REGame";
import { MRBasics } from "../data/MRBasics";
import { LExitPointBehavior } from "../lively/behaviors/LExitPointBehavior";
import { paramDefaultVisibiltyLength } from "../PluginParameters";
import { UMovement } from "../usecases/UMovement";
import { Helpers } from "./Helpers";

// いわゆる ナビゲーションAI 関係のサポート
export class SNavigationHelper {

    /*
    public static checkVisible(subject: LEntity, target: LEntity): boolean {
        const trap = target.findBehavior(LTrapBehavior);
        if (trap && !trap.exposed()) return false;

        // TODO: 透明状態とか

        return true;
    }

    */

    
    /**
     * subject から見て target は可視であるか
     * 
     * ミニマップ表示に使う。AIでは想定していない
     * 
     * @deprecated SView.getEntityVisibility
     */
    public static testVisibilityForMinimap(subject: LEntity, target: LEntity): boolean {
        const map = REGame.map;
        const targetBlock = REGame.map.block(target.mx, target.my);

        // Trap は未発見の場合、どのような勢力からであっても不可視
        const trap = target.findEntityBehavior(LTrapBehavior);
        if (trap) {
            if (map.trapClarity) return true;
            if (!trap.exposed()) return false;
        }

        // 味方は常に視認可能
        if (Helpers.isFriend(subject, target)) {
            return true;
        }

        // 隣接していれば Faction を問わず見える
        if (UMovement.checkAdjacentEntities(subject, target)) {
            return true;
        }

        // 同じ部屋にいれば Faction を問わず見える
        if (subject.isOnRoom() && subject.roomId() == target.roomId()) {
            const room = map.room(subject.roomId());
            if (room.poorVisibility) {
                // 視界不明瞭マップでは視界半径をチェック
                if (UMovement.blockDistance(subject.mx, subject.my, target.mx, target.my) <= paramDefaultVisibiltyLength) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        // const block = map.block(target.x, target.y);
        // if (block._passed) {
        //     return true;
        // }

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

        if (Helpers.isHostile(subject, target)) {

            if (subject.collectTraits().find(t => t.code == MRBasics.traits.UnitVisitor)) {
                return true;
            }

        }
        else {
            // 中立 target は、踏破済みの Block 上なら見える
            if (targetBlock._passed) {
                return true;
            }
        }

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

