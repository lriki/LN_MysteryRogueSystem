import { RESerializable, tr2 } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DecisionPhase, LBehavior } from "./LBehavior";

/**
 * 
 */
@RESerializable
export class LSurvivorBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSurvivorBehavior);
        return b
    }

    onAttached(self: LEntity): void {
        //const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
        //battler.setupExParam(DBasics.params.fp);
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.UpdateState) {

            // FP 減少
            self.gainActualParam(REBasics.params.fp, -1);


            switch (self.actualParam(REBasics.params.fp)) {
                case 3:
                    //cctx.postBalloon(entity, 6, false);
                    cctx.postMessage(tr2("だめだ！ もう倒れそうだ！"));
                    //cctx.postWait(entity, 10);
                    break;
                case 2:
                    cctx.postMessage(tr2("早く・・・なにか食べないと・・・"))
                    //cctx.postWait(entity, 10);
                    break;
                case 1:
                    cctx.postMessage(tr2("飢え死にしてしまう！"));
                    //cctx.postWait(entity, 10);
                    break;
            } 



            if (self.actualParam(REBasics.params.fp) <= 0) {
                // 満腹度 0 による HP 減少
                self.gainActualParam(REBasics.params.hp, -1);

                if (self.isDeathStateAffected()) {
                    cctx.postMessage(tr2("おなかがすいて倒れた・・・"));
                }
            }
            else {
                // HP自動回復
                self.gainActualParam(REBasics.params.hp, 1);
            }


            return SPhaseResult.Pass;
        }
        else {
            return SPhaseResult.Pass;
        }
    }
}
