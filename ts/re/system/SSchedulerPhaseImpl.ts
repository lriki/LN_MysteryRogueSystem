import { DecisionPhase } from "ts/re/objects/behaviors/LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SScheduler, SScheduler_old } from "./SScheduler";
import { RESystem } from "./RESystem";
import { UAction } from "../usecases/UAction";
import { LTOUnit } from "ts/re/objects/LScheduler";
import { LItemShopStructure } from "../objects/structures/LItemShopStructure";
import { SSchedulerPhase } from "./SSchedulerPhase";
import { LEntity } from "../objects/LEntity";
import { LUnitBehavior } from "../objects/behaviors/LUnitBehavior";
import { assert } from "../Common";




// export class SSchedulerPhase_Prepare extends SSchedulerPhase {
//     testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
//         return true;
//     }

//     onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
//         if (entity) {
//             entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Prepare);
//         }
//     }
// }

export class SSchedulerPhase_ManualAction extends SSchedulerPhase {
    isAllowIterationAtPrepare(): boolean {
        return false;
    }

    onStart(): void {
    }

    testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
        return unitBehavior.manualMovement() && entity._actionToken.canMajorAction();
    }

    onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
        assert(this.testProcessable(entity, unitBehavior));

        // 倍速対策。Pallarel 付きでも強制的に Flush.
        RESystem.sequelContext.flushSequelSet();

        entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.Manual);
    }
}

// モンスターの移動・攻撃対象決定
export class SSchedulerPhase_AIMinorAction extends SSchedulerPhase {
    isAllowIterationAtPrepare(): boolean {
        return false;
    }

    onStart(): void {
        for (const s of REGame.map.structures()) {
            if (s instanceof LItemShopStructure) {
                
            }
        }
    }
    
    testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
        return  !unitBehavior.manualMovement() &&
                entity._actionToken.canMinorAction() &&
                unitBehavior._targetingEntityId <= 0;   // Minor では行動対象決定の判定も見る
    }

    onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
        assert(this.testProcessable(entity, unitBehavior));
        entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMinor);
    }
    
    onEnd(scheduler: SScheduler): void {
        
        // ここまでの Phase で "歩行" Sequel のみ発生している場合に備え、
        // 罠の上へ移動している動きにしたいのでここで Flush.
        //RESystem.sequelContext.flushSequelSet();
        RESystem.sequelContext.attemptFlush(true);

        // 罠の処理
        for (const unit of scheduler.data()._schedulingUnits) {
            const unitBehavior = unit.unitBehavior();
            if (unitBehavior.requiredFeetProcess()) {
                UAction.postStepOnGround(RESystem.commandContext, unit.entity());
                unitBehavior.clearFeetProcess();
            }
        }
    }
}

// 状態異常の発動・解除、HPの自然回復・減少
/*
export class SSchedulerPhase_UpdateState extends SSchedulerPhase {
    onProcess(unit: UnitInfo): void {
        const entity = REGame.world.findEntity(unit.entityId);
        if (entity) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);
        }
    }
}
*/

// 敵対勢力の入室・退室・隣接によるモンスターの浅い眠り状態解除・目的地設定
export class SSchedulerPhase_ResolveAdjacentAndMovingTarget extends SSchedulerPhase {
    isAllowIterationAtPrepare(): boolean {
        return false;
    }

    onStart(): void {
        REGame.map.updateLocatedResults(RESystem.commandContext);
    }

    testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
        return false;
    }

    onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
        assert(this.testProcessable(entity, unitBehavior));
        entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.ResolveAdjacentAndMovingTarget);
    }
}

// 罠発動
export class SSchedulerPhase_CheckFeetMoved extends SSchedulerPhase {
    isAllowIterationAtPrepare(): boolean {
        return false;
    }
    
    onStart(): void {
        // ここまでの Phase で "歩行" Sequel のみ発生している場合に備え、
        // 罠の上へ移動している動きにしたいのでここで Flush.
        //RESystem.sequelContext.flushSequelSet();
        RESystem.sequelContext.attemptFlush(true);
    }
    
    testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
        return unitBehavior.requiredFeetProcess();
    }

    onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
        assert(this.testProcessable(entity, unitBehavior));
        if (unitBehavior.requiredFeetProcess()) {
            UAction.postStepOnGround(RESystem.commandContext, entity);
            unitBehavior.clearFeetProcess();
        }
    }
}

export class SSchedulerPhase_AIMajorAction extends SSchedulerPhase {
    isAllowIterationAtPrepare(): boolean {
        return true;
    }

    testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean {
        return !unitBehavior.manualMovement() && entity._actionToken.canMajorAction();
    }

    onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void {
        assert(this.testProcessable(entity, unitBehavior));
        entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
    }
}

