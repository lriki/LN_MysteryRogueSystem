import { DecisionPhase, onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/behaviors/LBehavior";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlock";
import { SScheduler } from "./SScheduler";
import { RESystem } from "./RESystem";
import { UnitInfo } from "ts/objects/LScheduler";
import { SEffectSubject } from "./SEffectContext";



export abstract class SSchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;
    
    onStart(scheduler: SScheduler): void {}

    // この処理の中で CommandContext にコマンドが積まれた場合、
    // Scheduler はその処理を始め、全てコマンドを実行し終えたら次の unit の処理に移る。
    // コマンドが積まれなかった場合、即座に次の unit の処理に移る。
    abstract onProcess(scheduler: SScheduler, unit: UnitInfo): void;
}

export class SSchedulerPhase_Prepare extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Prepare);
        }
    }
}

export class SSchedulerPhase_ManualAction extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Manual);
        }
    }
}

// モンスターの移動・攻撃対象決定
export class SSchedulerPhase_AIMinorAction extends SSchedulerPhase {

    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        
        if (entity && !unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0 &&
            unit.behavior._targetingEntityId <= 0) {    // Minor では行動対象決定の判定も見る
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMinor);
        }
    }
}

// 状態異常の発動・解除、HPの自然回復・減少
export class SSchedulerPhase_UpdateState extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);
        }
    }
}

// 敵対勢力の入室・退室・隣接によるモンスターの浅い眠り状態解除・目的地設定
export class SSchedulerPhase_ResolveAdjacentAndMovingTarget extends SSchedulerPhase {
    onStart(scheduler: SScheduler): void {
        REGame.map.updateLocatedResults(RESystem.commandContext);
    }

    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.ResolveAdjacentAndMovingTarget);
        }
    }
}

// 罠発動
export class SSchedulerPhase_CheckFeetMoved extends SSchedulerPhase {
    
    onStart(scheduler: SScheduler): void {
        // ここまでの Phase で "歩行" Sequel のみ発生している場合に備え、
        // 罠の上へ移動している動きにしたいのでここで Flush.
        RESystem.sequelContext.flushSequelSet();
    }
    
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && unit.behavior.requiredFeetProcess()) {
            const actor = entity;
            const block = REGame.map.block(actor.x, actor.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const reactor = layer.firstEntity();
            if (reactor) {
                const c = RESystem.commandContext;
                c.post(actor, reactor, new SEffectSubject(actor), undefined, onWalkedOnTopAction);
                c.post(reactor, actor, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
            }
            unit.behavior.clearFeetProcess();
        }
    }
}

export class SSchedulerPhase_AIMajorAction extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity && !unit.behavior.manualMovement() && unit.behavior.actionTokenCount() > 0) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
        }
    }
}

