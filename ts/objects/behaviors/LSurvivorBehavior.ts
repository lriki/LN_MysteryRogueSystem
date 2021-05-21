import { tr2 } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { DecisionPhase, LBehavior } from "./LBehavior";

/**
 * 
 */
export class LSurvivorBehavior extends LBehavior {

    onAttached(): void {
        //const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
        //battler.setupExParam(DBasics.params.fp);
    }

    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.UpdateState) {

            // FP 減少
            const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
            battler.gainActualParam(DBasics.params.fp, -1);


            switch (battler.actualParam(DBasics.params.fp)) {
                case 3:
                    context.postBalloon(entity, 6, false);
                    context.postMessage(tr2("だめだ！　もう倒れそうだ！"));
                    context.postWait(entity, 10);
                    break;
                case 2:
                    context.postMessage(tr2("早く・・・なにか食べないと・・・"))
                    context.postWait(entity, 10);
                    break;
                case 1:
                    context.postMessage(tr2("飢え死にしてしまう！"));
                    context.postWait(entity, 10);
                    break;
            } 



            if (battler.actualParam(DBasics.params.fp) <= 0) {
                // 満腹度 0 による HP 減少
                battler.gainActualParam(DBasics.params.hp, -1);
            }
            else {
                // HP自動回復
                battler.gainActualParam(DBasics.params.hp, 1);
            }


            return SPhaseResult.Pass;
        }
        else {
            return SPhaseResult.Pass;
        }
    }
}
