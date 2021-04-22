import { LTrapBehavior } from "ts/objects/behaviors/LTrapBehavior";
import { LEntity } from "ts/objects/LEntity";

// いわゆる ナビゲーションAI 関係のサポート
export class SNavigationHelper {
    /**
     * subject から見て target は可視であるか
     */
    public static checkVisible(subject: LEntity, target: LEntity): boolean {
        const trap = target.findBehavior(LTrapBehavior);
        if (trap && !trap.exposed()) return false;

        // TODO: 透明状態とか

        return true;
    }
}

