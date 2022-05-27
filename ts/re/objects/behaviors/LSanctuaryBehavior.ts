import { RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LFieldEffect, LSanctuaryFieldEffect } from "../LFieldEffect";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LEnemyBehavior } from "./LEnemyBehavior";
import { LGlueToGroundBehavior } from "./LGlueToGroundBehavior";


/**
 * 
 */
@RESerializable
export class LSanctuaryBehavior extends LBehavior {
    private _fieldEffect: LSanctuaryFieldEffect | undefined;

    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSanctuaryBehavior);
        return b;
    }

    onAttached(self: LEntity): void {
        this._fieldEffect = new LSanctuaryFieldEffect(self);
    }

    onDetached(self: LEntity): void {
        this._fieldEffect = undefined;
    }

    // v0.1.0 では歩行侵入時に処理していたが、それ以外にも Block への侵入は様々にあるので、
    // カバーしきれるように onStabilizeSituation() を使う。
    // onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {
    //     const block = REGame.map.tryGetBlock(self.mx, self.my);
    //     if (block) {
    //         for (const entity of block.getEntities()) {
    //             // 戦闘不能ステート 付加
    //             if (entity.findEntityBehavior(LEnemyBehavior)) {
    //                 entity.addState(REBasics.states.dead);
    //             }
    //         }
    //     }
    //     return SCommandResponse.Pass;
    // }

    
    *onCollectFieldEffect(self: LEntity): Generator<LFieldEffect, void, unknown> {
        const glue = self.getEntityBehavior(LGlueToGroundBehavior);
        if (glue.glued && this._fieldEffect) {
            yield this._fieldEffect;
        }
    }
}

