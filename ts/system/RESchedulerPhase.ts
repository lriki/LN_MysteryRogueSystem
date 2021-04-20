import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { DecisionPhase, onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/behaviors/LBehavior";
import { MonsterHouseState } from "ts/objects/LRoom";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlock";
import { Helpers } from "./Helpers";
import { REResponse } from "./RECommand";
import { SScheduler } from "./SScheduler";
import { RESystem } from "./RESystem";
import { UnitInfo } from "ts/objects/LScheduler";



export abstract class RESchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;
    
    onStart(scheduler: SScheduler): void {}

    // このフェーズで何も処理を行わず、即座に次の Unit へ処理を渡す場合は false を返す。
    // true を返した場合、行動トークンを消費しなければならない。(そうしないとゲームがハングする)
    abstract onProcess(scheduler: SScheduler, unit: UnitInfo): boolean;
}

export class RESchedulerPhase_Prepare extends RESchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Prepare);
        }
        // このフェーズは通知のみ行うため、_actionConsumed は不要。通過するだけ。
        return false;
    }
}

export class RESchedulerPhase_ManualAction extends RESchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Manual);
            return true;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}

// モンスターの移動・攻撃対象決定
export class RESchedulerPhase_AIMinorAction extends RESchedulerPhase {

    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        
        if (entity && !unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0 &&
            unit.behavior._targetingEntityId <= 0) {    // Minor では行動対象決定の判定も見る
            const response = entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMinor);
            if (response == REResponse.Succeeded) 
                return true;
            else
                return false;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}


// 敵対勢力の入室・退室・隣接によるモンスターの浅い眠り状態解除・目的地設定
export class RESchedulerPhase_ResolveAdjacentAndMovingTarget extends RESchedulerPhase {
    onStart(scheduler: SScheduler): void {
        REGame.map.updateLocatedResults(RESystem.commandContext);
    }

    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.ResolveAdjacentAndMovingTarget);
        }
        // このフェーズでは通知のみを行う。
        // トークンを消費するような行動をとってもらうことは無いので、そのまま次へ進む。
        return false;
    }
}

// 罠発動
export class RESchedulerPhase_CheckFeetMoved extends RESchedulerPhase {
    
    onStart(scheduler: SScheduler): void {
        // ここまでの Phase で "歩行" Sequel のみ発生している場合に備え、
        // 罠の上へ移動している動きにしたいのでここで Flush.
        RESystem.sequelContext.flushSequelSet();
    }
    
    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && unit.behavior.requiredFeetProcess()) {
            const actor = entity;
            const block = REGame.map.block(actor.x, actor.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const reactor = layer.firstEntity();
            if (reactor) {
                const c = RESystem.commandContext;
                c.post(actor, reactor, undefined, onWalkedOnTopAction);
                c.post(reactor, actor, undefined, onWalkedOnTopReaction);
            }
            unit.behavior.clearFeetProcess();
        }
        return false;
    }
}

export class RESchedulerPhase_AIMajorAction extends RESchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): boolean {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && !unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0) {
            const response = entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
            if (response == REResponse.Succeeded) 
                return true;
            else
                return false;
        }
        else {
            // このフェーズでは実行できない step だった。次の step へ。
            return false;
        }
    }
}

