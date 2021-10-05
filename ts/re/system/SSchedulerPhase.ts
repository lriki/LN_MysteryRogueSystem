import { DecisionPhase } from "ts/re/objects/behaviors/LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SScheduler } from "./SScheduler";
import { RESystem } from "./RESystem";
import { UAction } from "../usecases/UAction";
import { LTOUnit } from "ts/re/objects/LScheduler";
import { LItemShopStructure } from "../objects/structures/LItemShopStructure";



export abstract class SSchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;
    
    onStart(scheduler: SScheduler): void {}

    // この処理の中で CommandContext にコマンドが積まれた場合、
    // Scheduler はその処理を始め、全てコマンドを実行し終えたら次の unit の処理に移る。
    // コマンドが積まれなかった場合、即座に次の unit の処理に移る。
    abstract onProcess(scheduler: SScheduler, unit: LTOUnit): void;

}

export class SSchedulerPhase_Prepare extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Prepare);
        }
    }
}

export class SSchedulerPhase_ManualAction extends SSchedulerPhase {
    onStart(scheduler: SScheduler): void {
    }

    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
        if (entity && unit.behavior().manualMovement() && entity._actionToken.canMajorAction()) {

            // 倍速対策。Pallarel 付きでも強制的に Flush.
            RESystem.sequelContext.flushSequelSet();

            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Manual);
        }
    }
}

// モンスターの移動・攻撃対象決定
export class SSchedulerPhase_AIMinorAction extends SSchedulerPhase {
    onStart(scheduler: SScheduler): void {
        for (const s of REGame.map.structures()) {
            if (s instanceof LItemShopStructure) {
                
            }
        }
    }
    

    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
        
        if (entity && !unit.behavior().manualMovement() && entity._actionToken.canMinorAction() &&
            unit.behavior()._targetingEntityId <= 0) {    // Minor では行動対象決定の判定も見る
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMinor);
            //REGame.scheduler.setCurrentTurnEntity(entity);
        }
    }
}

// 状態異常の発動・解除、HPの自然回復・減少
/*
export class SSchedulerPhase_UpdateState extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);
        }
    }
}
*/

// 敵対勢力の入室・退室・隣接によるモンスターの浅い眠り状態解除・目的地設定
export class SSchedulerPhase_ResolveAdjacentAndMovingTarget extends SSchedulerPhase {
    onStart(scheduler: SScheduler): void {
        REGame.map.updateLocatedResults(RESystem.commandContext);
    }

    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
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
        //RESystem.sequelContext.flushSequelSet();
        RESystem.sequelContext.attemptFlush(true);
    }
    
    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
        if (entity && unit.behavior().requiredFeetProcess()) {
            UAction.postStepOnGround(RESystem.commandContext, entity);
            unit.behavior().clearFeetProcess();
        }
    }
}

export class SSchedulerPhase_AIMajorAction extends SSchedulerPhase {
    onProcess(scheduler: SScheduler, unit: LTOUnit): void {
        const entity = REGame.world.findEntity(unit.entityId());
        if (entity && !unit.behavior().manualMovement() && entity._actionToken.canMajorAction()) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
        }
    }
}

