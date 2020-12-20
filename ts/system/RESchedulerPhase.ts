import { DecisionPhase } from "ts/objects/behaviors/LBehavior";
import { REScheduler, UnitInfo } from "./REScheduler";



export abstract class RESchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;

    // このフェーズで何も処理を行わず、即座に次の Unit へ処理を渡す場合は false を返す。
    // true を返した場合、行動トークンを消費しなければならない。(そうしないとゲームがハングする)
    abstract onProcess(scheduler: REScheduler, unit: UnitInfo): boolean;
}

export class RESchedulerPhase_ManualAction extends RESchedulerPhase {
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        if (unit.entity && unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            unit.entity._callDecisionPhase(scheduler.commandContext(), DecisionPhase.Manual);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}

export class RESchedulerPhase_AIMinorAction extends RESchedulerPhase {
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        
        if (unit.entity && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0 &&
        unit.attr._targetingEntityId <= 0) {    // Minor では行動対象決定の判定も見る
            unit.entity._callDecisionPhase(scheduler.commandContext(), DecisionPhase.AIMinor);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}


export class RESchedulerPhase_AIMajorAction extends RESchedulerPhase {
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        if (unit.entity && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            unit.entity._callDecisionPhase(scheduler.commandContext(), DecisionPhase.AIMajor);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}

