import { DecisionPhase } from "ts/re/objects/behaviors/LBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SScheduler, SScheduler_old } from "./SScheduler";
import { RESystem } from "../RESystem";
import { UAction } from "../../usecases/UAction";
import { LTOUnit } from "ts/re/objects/LScheduler";
import { LItemShopStructure } from "../../objects/structures/LItemShopStructure";
import { SSchedulerPhase } from "./SSchedulerPhase";
import { LEntity } from "../../objects/LEntity";
import { LUnitBehavior } from "../../objects/behaviors/LUnitBehavior";
import { assert } from "../../Common";




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
        // 移動フェーズでは、iteration を組んでまとめて移動は禁止。
        // ステート更新は全 Entity の移動が終わった後に行いたいので、
        // こうしておかないと倍速モンスターのステートターン数が余分に出てしまう。
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
        RESystem.sequelContext.attemptFlush(false);

        // BUG: [2021/11/18]
        // 移動→ワープの罠にかかったとき、ワープ後の座標へ歩行移動してから、その場でワープモーションを取る問題がある。
        // 原因は、entity の座標が変わった後に 移動とワープSequel が同時に Flush されるため。
        // 最初の移動Sequel時点ではすでに移動目標がワープ先になっている。
        //
        // これを解決するには…
        // A. 移動Sequel自体に、移動先座標を渡す。(entityの座標を直接参照しない)
        // B. ワナ発動前に強制 Flush する。
        //
        // B の場合、AIMinor End のタイミングで強制 flush してしまうと、倍速 Entity の動きが1マスごとに Flush されてしまう。
        // v0.3.0 では B のようにしていたが、そんな理由のため修正することになった。
        //
        // ということで A でやるしかない。
        

        // ステート更新は全 Entity の移動が終わった後に行いたい
        // let feetRequired = false;
        for (const unit of scheduler.data()._schedulingUnits) {
            if (unit.isValid()) {
                const entity = unit.entity();
                // - Manual の場合はここで必ずステート更新
                // - NPC の場合は、移動が発生していたら更新
                if (unit.isManual() ||
                    entity._schedulingResult.consumedActionToken(scheduler.data().currentPhaseIndex()) !== undefined) {
                    entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);
                }

                // 現在 step 内で何らかのトークン消費があった場合は行動が発生したとみなし、それに関する処理を行う
                //if () {
                //}
                
                // if (unit.unitBehavior().requiredFeetProcess()) {
                //     feetRequired = true;
                // }
            }
        }
        
        // if (feetRequired) {
        //     RESystem.sequelContext.attemptFlush(true);
        // }
        // else {
        //     RESystem.sequelContext.attemptFlush(false);
        // }

        // 罠の処理は Phase 終了時に行う必要がある。
        // 罠の発動タイミングは Minor と Major で異なる点に注意。
        // Minor では、Phase終了時、つまり全 Unit の1回分(≒1Block分)の移動が終わった時に行う必要がある。
        for (const unit of scheduler.data()._schedulingUnits) {
            if (unit.isValid()) {
                const unitBehavior = unit.unitBehavior();
                if (unitBehavior.requiredFeetProcess()) {
                    UAction.postStepOnGround(RESystem.commandContext, unit.entity());
                    unitBehavior.clearFeetProcess();
                }
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
        return true;
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
        //assert(this.testProcessable(entity, unitBehavior));
        if (this.testProcessable(entity, unitBehavior)) {
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.AIMajor);
            
            entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);
        }
    }
}

