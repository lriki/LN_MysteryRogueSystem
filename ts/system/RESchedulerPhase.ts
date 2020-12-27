import { DecisionPhase, onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/behaviors/LBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { REScheduler, UnitInfo } from "./REScheduler";
import { RESystem } from "./RESystem";



export abstract class RESchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;
    
    onStart(scheduler: REScheduler): void {}

    // このフェーズで何も処理を行わず、即座に次の Unit へ処理を渡す場合は false を返す。
    // true を返した場合、行動トークンを消費しなければならない。(そうしないとゲームがハングする)
    abstract onProcess(scheduler: REScheduler, unit: UnitInfo): boolean;
}

export class RESchedulerPhase_ManualAction extends RESchedulerPhase {
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        if (unit.entity && unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            unit.entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Manual);
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
            unit.entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMinor);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}


export class RESchedulerPhase_CheckFeetMoved extends RESchedulerPhase {
    
    onStart(scheduler: REScheduler): void {
        RESystem.sequelContext.flushSequelSet();
    }
    
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        if (unit.entity && unit.behavior.requiredFeetProcess()) {
            const actor = unit.entity;
            const block = REGame.map.block(actor.x, actor.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const reactor = layer.firstEntity();
            if (reactor) {
                const c = RESystem.commandContext;
                c.post(actor, reactor, undefined, onWalkedOnTopAction);
                c.post(reactor, actor, undefined, onWalkedOnTopReaction);
            }
        }
        return false;
    }
}

export class RESchedulerPhase_AIMajorAction extends RESchedulerPhase {
    onProcess(scheduler: REScheduler, unit: UnitInfo): boolean {
        if (unit.entity && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            unit.entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}

