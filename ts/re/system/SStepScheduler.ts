
import { assert } from "../Common";
import { LScheduler2, LSchedulingUnit, LTOStep, RunInfo } from "../objects/LScheduler";
import { REGame } from "../objects/REGame";
import { RESystem } from "./RESystem";
import { SCommandContext } from "./SCommandContext";
import { SStepPhase } from "./SCommon";
import { SScheduler, SScheduler_old } from "./SScheduler";
import { SSchedulerPhase } from "./SSchedulerPhase";
import { SSchedulerPhase_AIMajorAction, SSchedulerPhase_AIMinorAction, SSchedulerPhase_CheckFeetMoved, SSchedulerPhase_ManualAction, SSchedulerPhase_ResolveAdjacentAndMovingTarget } from "./SSchedulerPhaseImpl";




// SScheduler が複雑になってきたので、Run 1つ分の実行部分を分離したもの。
// Note:
// - Run は複数の Phase から成る
// - 1つの Phase では全 Entity に対して Process を実行する
export class SStepScheduler2 {
    private _scheduler: SScheduler;
    private _data: LScheduler2;
    private _cctx: SCommandContext;
    private _stepPhase: SStepPhase;
    private _phases: SSchedulerPhase[];

    public constructor(scheduler: SScheduler) {
        this._scheduler = scheduler;
        this._data = scheduler.data();
        this._cctx = RESystem.commandContext;
        this._stepPhase = SStepPhase.RunStarting;
        this._phases = [
            //new SSchedulerPhase_Prepare(),
            new SSchedulerPhase_ManualAction(),
            new SSchedulerPhase_AIMinorAction(),
            //new SSchedulerPhase_UpdateState(),
            new SSchedulerPhase_ResolveAdjacentAndMovingTarget(),
            //new SSchedulerPhase_CheckFeetMoved(),
            new SSchedulerPhase_AIMajorAction(),
        ];
    }

    public start(): void {
        this._data = this._scheduler.data();
        this._data.nextSearchIndex = 0;
        this._data._currentPhaseIndex = -1;
        this._stepPhase = SStepPhase.RunStarting;

        // Reset attack/move target
        for (const unit of this._data.schedulingUnits()) {
            if (unit.isValid()) {
                unit.unitBehavior()._targetingEntityId = 0;
            }
        }
    }

    public process(): boolean {
        assert(this._stepPhase != SStepPhase.Closed);

        while (true) {
            if (this.isSequenceClosed()) {
                break;
            }

            if (RESystem.commandContext.isRunning()) {
                break;
            }
            this.processCore2();
        }

        return !this.isSequenceClosed();
    }
    
    private isSequenceClosed(): boolean {
        return this._stepPhase == SStepPhase.Closed;
    }

    private currentPhase(): SSchedulerPhase {
        const index = this._data.currentPhaseIndex();
        assert(0 <= index && index < this._phases.length);
        return this._phases[index];
    }

    private processCore2(): void {
        switch (this._stepPhase) {
            case SStepPhase.RunStarting:
                this.process_RunStarting();
                break;
            case SStepPhase.PhaseStarting:
                this.process_PhaseStarting();
                break;
            case SStepPhase.StepStarting:
                this.process_StepStarting();
                break;
            case SStepPhase.MainProcess:
                this.process_MainProcess();
                break;
            case SStepPhase.MainProcessClosing:
                this.process_MainProcessClosing();
                break;
            case SStepPhase.AfterProcess:
                this.process_AfterProcess();
                break;
            case SStepPhase.AfterProcessClosing:
                this.process_AfterProcessClosing();
                break;
            case SStepPhase.StepClosing:
                this.process_StepClosing();
                break;
            case SStepPhase.PhaseClosing:
                this.process_PhaseClosing();
                break;
            case SStepPhase.RunClosing:
                this.process_RunClosing();
                break;
                
            case SStepPhase.Closed:
                throw new Error("Unreachable.");
            default:
                throw new Error("Unreachable.");
        }
    }

    private process_RunStarting(): void {
        if (this._data.schedulingUnits().length <= 0) {
            // Unit がひとつもない。何もする必要はない。
            this._stepPhase = SStepPhase.RunClosing;
        }
        else {
            this._data._currentPhaseIndex = -1;
            this._stepPhase = SStepPhase.PhaseStarting;
        }
    }

    private process_PhaseStarting(): void {
        this._data.resetSeek();
        this._data._currentPhaseIndex++;
        if (this._data._currentPhaseIndex >= this._phases.length) {
            // 全 Phase 実行完了
            this._stepPhase = SStepPhase.RunClosing;
        }
        else {
            this.currentPhase().onStart();
            this._stepPhase = SStepPhase.StepStarting;
        }
    }

    private process_StepStarting(): void {
        if (this._data.nextUnit(this.currentPhase())) {
            this._stepPhase = SStepPhase.MainProcess;
        }
        else {
            // currentPhase で実行の必要があるものはすべて終えた
            this._stepPhase = SStepPhase.PhaseClosing;
        }
    }

    private process_MainProcess(): void {
        const unit = this._data.currentUnit();
        if (unit.isValid()) {
            this.currentPhase().onProcess(unit.entity(), unit.unitBehavior());
        }

        // この後は、
        // - もし onProcess で Command が詰まれていれば一度 process から抜けたのち、process_MainProcessClosing() へ移る。
        // - Command が詰まれなかったら process を抜けずに process_MainProcessClosing() へ移る。
        this._stepPhase = SStepPhase.MainProcessClosing;
    }

    private process_MainProcessClosing(): void {
        this._stepPhase = SStepPhase.AfterProcess;
    }

    private process_AfterProcess(): void {
        for (const entity of REGame.map.entities()) {
            entity._callBehaviorIterationHelper(behavior => behavior.onAfterStep(entity, RESystem.commandContext));
        }

        // この後の流れは process_MainProcessClosing と同様。必要であれば一度 process を抜ける。
        this._stepPhase = SStepPhase.AfterProcessClosing;
    }

    private process_AfterProcessClosing(): void {
        this._stepPhase = SStepPhase.StepClosing;
    }

    private process_StepClosing(): void {
        const unit = this._data.currentUnit();
        unit.increaseIterationCount();
        this.onStepProcessEnd(unit);
        if (unit.isIterationClosed()) {
            if (this._data.isSeeking()) {
                // まだ実行するべき Step があるかも。(実際に next してみるまではわからない)
                this._stepPhase = SStepPhase.StepStarting;
            }
            else {
                // Step の実行が終わった。Phase 終了。
                this._stepPhase = SStepPhase.PhaseClosing;
            }
        }
        else {
            // まだ iterationCount が残っているので、同じ Step を再び実行する
            this._stepPhase = SStepPhase.MainProcess;
        }

    }
    
    private process_PhaseClosing(): void {
        this.currentPhase().onEnd(this._scheduler);
        this._stepPhase = SStepPhase.PhaseStarting;
    }

    private process_RunClosing(): void {
        //if (this._data.hasReadyEntity()) {
            //console.log("まだ行動できる Entity が残っている");
            // まだ行動できる Entity が残っている場合は Run を続ける

        this._data.currentRunIndex++;
        if (this._data.currentRunIndex >= this._data.maxRunCount) {
            this._stepPhase = SStepPhase.Closed;
        }
        else {
            this._stepPhase = SStepPhase.RunStarting;
        }
    }


    // onProcess ひとつから発行されるコマンドチェーンを実行し終えたタイミング。
    // Manual, Minor, Major 等フェーズのたびに発生する。
    private onStepProcessEnd(unit: LSchedulingUnit): void {

        //if (this._stepPhase == SStepPhase.AfterProcess) {
            // REGame.scheduler.actorEntities().forEach(entity => {
            //     entity._callBehaviorIterationHelper(behavior => behavior.onStepEnd(RESystem.commandContext));
            // });
            // Trap の状態リセットも行いたいので、マップ上の全 Entity に対して通知する
            for (const entity of REGame.map.entities()) {
                entity._callBehaviorIterationHelper(behavior => behavior.onStepEnd(RESystem.commandContext));
            }
        //}

        
        if (unit.isValid()) {
            const entity = unit.entity();

            //entity._effectResult.showResultMessages(RESystem.commandContext, entity);

            entity._reward.apply(entity);
            entity._effectResult.showResultMessages(RESystem.commandContext, entity);
            entity._effectResult.clear();
        }

        this._data.attemptRefreshSpeedLevel();
    }

    // private onPhaseEnd(): void {

    // }

}











// SScheduler が複雑になってきたので、Run 1つ分の実行部分を分離したもの。
// Note:
// - Run は複数の Phase から成る
// - 1つの Phase では全 Entity に対して Process を実行する
export class SStepScheduler {
    private _scheduler: SScheduler_old;
    private _cctx: SCommandContext;
    private _stepPhase: SStepPhase;
    private _phases: SSchedulerPhase[];

    public constructor(scheduler: SScheduler_old) {
        this._scheduler = scheduler;
        this._cctx = RESystem.commandContext;
        this._stepPhase = SStepPhase.RunStarting;
        this._phases = [
            //new SSchedulerPhase_Prepare(),
            new SSchedulerPhase_ManualAction(),
            new SSchedulerPhase_AIMinorAction(),
            //new SSchedulerPhase_UpdateState(),
            new SSchedulerPhase_ResolveAdjacentAndMovingTarget(),
            new SSchedulerPhase_CheckFeetMoved(),
            new SSchedulerPhase_AIMajorAction(),
        ];
    }

    public startRun(): void {
        REGame.scheduler_old._currentStep = -1;
        REGame.scheduler_old._currentPhaseIndex = -1;
        this._stepPhase = SStepPhase.RunStarting;
    }

    public process(): boolean {
        assert(this._stepPhase != SStepPhase.Closed);

        while (true) {
            if (this.isSequenceClosed()) {
                break;
            }

            if (RESystem.commandContext.isRunning()) {
                break;
            }
            this.processCore2();
        }

        return !this.isSequenceClosed();
    }
    
    private currentPhaseIndex(): number {
        return REGame.scheduler_old.currentPhaseIndex();
    }
    
    private currentRun(): RunInfo {
        return REGame.scheduler_old.currentRun();
    }

    private currentStep(): LTOStep {
        const run = this.currentRun();
        return run.steps[REGame.scheduler_old._currentStep];
    }

    private isSequenceClosed(): boolean {
        return this._stepPhase == SStepPhase.Closed;
    }

    private processCore2(): void {
        switch (this._stepPhase) {
            case SStepPhase.RunStarting:
                this.process_SequenceStarting();
                break;
            case SStepPhase.PhaseStarting:
                this.process_PhaseStarting();
                break;
            case SStepPhase.StepStarting:
                this.process_StepStarting();
                break;
            case SStepPhase.MainProcess:
                this.process_MainProcess();
                break;
            case SStepPhase.MainProcessClosing:
                this.process_MainProcessClosing();
                break;
            case SStepPhase.AfterProcess:
                this.process_AfterProcess();
                break;
            case SStepPhase.AfterProcessClosing:
                this.process_AfterProcessClosing();
                break;
            case SStepPhase.StepClosing:
                this.process_StepClosing();
                break;
                
                
            case SStepPhase.Closed:
                throw new Error("Unreachable.");
            default:
                throw new Error("Unreachable.");
        }
    }

    private process_SequenceStarting(): void {
        const run = this.currentRun();
        if (run.steps.length <= 0) {
            // Run 内に Step がひとつもない。何もする必要はない。
            this._stepPhase = SStepPhase.Closed;
        }
        else {
            this._stepPhase = SStepPhase.PhaseStarting;
        }
    }

    private process_PhaseStarting(): void {
        REGame.scheduler_old._currentStep = -1;
        REGame.scheduler_old._currentPhaseIndex++;
        if (REGame.scheduler_old._currentPhaseIndex >= this._phases.length) {
            // 全 Phase 実行完了
            this._stepPhase = SStepPhase.Closed;
        }
        else {
            this._phases[this.currentPhaseIndex()].onStart();
            this._stepPhase = SStepPhase.StepStarting;
        }
    }

    private process_StepStarting(): void {
        const run = this.currentRun();
        REGame.scheduler_old._currentStep++;
        assert(REGame.scheduler_old._currentStep < run.steps.length);   // この時点では必ず実行するべき step があるはず
        this._stepPhase = SStepPhase.MainProcess;
    }

    private process_MainProcess(): void {
        const phase = this._phases[this.currentPhaseIndex()];
        const step = this.currentStep();
        if (step.isValid()) {
            const unit = step.unit();
            phase.onProcess(unit.entity(), unit.behavior());
        }

        // この後は、
        // - もし onProcess で Command が詰まれていれば一度 process から抜けたのち、process_MainProcessClosing() へ移る。
        // - Command が詰まれなかったら process を抜けずに process_MainProcessClosing() へ移る。
        this._stepPhase = SStepPhase.MainProcessClosing;
    }

    private process_MainProcessClosing(): void {
        this._stepPhase = SStepPhase.AfterProcess;
    }

    private process_AfterProcess(): void {
        for (const entity of REGame.map.entities()) {
            entity._callBehaviorIterationHelper(behavior => behavior.onAfterStep(entity, RESystem.commandContext));
        }

        // この後の流れは process_MainProcessClosing と同様。必要であれば一度 process を抜ける。
        this._stepPhase = SStepPhase.AfterProcessClosing;
    }

    private process_AfterProcessClosing(): void {
        this._stepPhase = SStepPhase.StepClosing;
    }

    private process_StepClosing(): void {
        const step = this.currentStep();
        step.increaseIterationCount();
        this.onStepProcessEnd(step);
        if (step.isIterationClosed()) {
            const run = this.currentRun();
            if (REGame.scheduler_old._currentStep + 1 < run.steps.length) {
                // まだ実行するべき Step がある
                this._stepPhase = SStepPhase.StepStarting;
            }
            else {
                // Step の実行が終わった。次の Phase へ。
                this._stepPhase = SStepPhase.PhaseStarting;
            }
        }
        else {
            // まだ iterationCount が残っているので、同じ Step を再び実行する
            this._stepPhase = SStepPhase.MainProcess;
        }

    }
    


    // onProcess ひとつから発行されるコマンドチェーンを実行し終えたタイミング。
    // Manual, Minor, Major 等フェーズのたびに発生する。
    private onStepProcessEnd(step: LTOStep): void {

        //if (this._stepPhase == SStepPhase.AfterProcess) {
            // REGame.scheduler.actorEntities().forEach(entity => {
            //     entity._callBehaviorIterationHelper(behavior => behavior.onStepEnd(RESystem.commandContext));
            // });
            // Trap の状態リセットも行いたいので、マップ上の全 Entity に対して通知する
            for (const entity of REGame.map.entities()) {
                entity._callBehaviorIterationHelper(behavior => behavior.onStepEnd(RESystem.commandContext));
            }
        //}

        
        const unit = step.unit();
        if (unit.isValid()) {
            const entity = unit.entity();

            //entity._effectResult.showResultMessages(RESystem.commandContext, entity);

            entity._reward.apply(entity);
            entity._effectResult.showResultMessages(RESystem.commandContext, entity);
            entity._effectResult.clear();
        }

        REGame.scheduler_old.attemptRefreshTurnOrderTable();
    }


    public static processFeet(): void {

    }
}

