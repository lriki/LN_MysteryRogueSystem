import { RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LEnemyBehavior } from "./LEnemyBehavior";


/**
 * 
 */
@RESerializable
export class LSanctuaryBehavior extends LBehavior {


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSanctuaryBehavior);
        return b;
    }

    // v0.1.0 では歩行侵入時に処理していたが、それ以外にも Block への侵入は様々にあるので、
    // カバーしきれるように onStabilizeSituation() を使う。
    onStabilizeSituation(self: LEntity, context: SCommandContext): SCommandResponse {
        const block = REGame.map.tryGetBlock(self.x, self.y);
        if (block) {
            for (const entity of block.getEntities()) {
                // 戦闘不能ステート 付加
                if (entity.findEntityBehavior(LEnemyBehavior)) {
                    entity.addState(REBasics.states.dead);
                }
            }
        }
        return SCommandResponse.Pass;
    }

}

