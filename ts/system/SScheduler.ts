import { assert, Log } from "../Common";
import { RECommandContext } from "./RECommandContext";
import { REData } from "../data/REData";
import { REDialog, REDialogContext } from "./REDialog";
import { REGame } from "../objects/REGame";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { DecisionPhase, LBehavior } from "../objects/behaviors/LBehavior";
import { LEntity } from "../objects/LEntity";
import { SSequelUnit, RESequelSet } from "../objects/REGame_Sequel";
import { RESystem } from "./RESystem";
import { RESchedulerPhase, RESchedulerPhase_AIMajorAction, RESchedulerPhase_AIMinorAction, RESchedulerPhase_CheckFeetMoved, RESchedulerPhase_ManualAction, RESchedulerPhase_Prepare, RESchedulerPhase_ResolveAdjacentAndMovingTarget } from "./RESchedulerPhase";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";
import { SSequelContext } from "./SSequelContext";
import { RunStepInfo } from "ts/objects/LScheduler";



enum SchedulerPhase
{
    PartStarting,

    RunStarting,

    /**
     * マニュアル入力
     * Dialog が close すると、次の Phase に進む。
     */
    //ManualAction,

    /**
     * AI 行動フェーズ 1
     * モンスターの移動・攻撃対象決定
     */
    //AIMinorAction,

    /**
     * AI 行動フェーズ 2
     */
    //AIMajorAction,
    Processing,

    RunEnding,

    PartEnding,
}


/**
 * see Scheduler.md
 */
export class SScheduler
{
    private _phase: SchedulerPhase = SchedulerPhase.PartStarting;

    private _phases: RESchedulerPhase[];
    private _brace: boolean = false;
    private _occupy: boolean = false;

    

    constructor() {
        this._phases = [
            new RESchedulerPhase_Prepare(),
            new RESchedulerPhase_ManualAction(),
            new RESchedulerPhase_AIMinorAction(),
            new RESchedulerPhase_ResolveAdjacentAndMovingTarget(),
            new RESchedulerPhase_CheckFeetMoved(),
            new RESchedulerPhase_AIMajorAction(),
        ];
    }

    private currentPhaseIndex(): number {
        return REGame.scheduler.currentPhaseIndex();
    }

    // マップ切り替え時など。
    // DialogContext はクリアしない。RMMZ イベント実行のための Dialog が動いている可能性があるため。
    clear() {
        RESystem.sequelContext.clear();
        RESystem.commandContext.clear();
        this._phase = SchedulerPhase.PartStarting;
        REGame.scheduler.clear();
        Log.d("ResetScheduler");
    }

    stepSimulation(): void {
        const dialogContext = RESystem.dialogContext;
        const commandContext = RESystem.commandContext;

        while (true) {
            // Sequel 終了待ち
            if (RESystem.integration.onCheckVisualSequelRunning()) {
                // Sequel 実行中
                break;
            }

            if (REGame.camera.isFloorTransfering()) {
                // マップ遷移中。
                // postTransferFloor() の実行によって遷移が発生した場合は一度実行ループを抜けておかないと、
                // 遷移が実際に行われる前に次のコマンド実行に進んでしまう。
                break;
            }

            if (this._brace) {
                this._brace = false;
                break;
            }

            /*
            if (RESystem.commandContext.visualAnimationWaiting()) {
                if (RESystem.integration.onCheckVisualSequelRunning()) {
                    // Sequel 実行中
                    break;
                }
                else {
                    // Sequel 終了
                    RESystem.commandContext.clearVisualAnimationWaiting();
                }
            }
            */

            // 現在のコマンドリストの実行は終了しているが、Visual 側がアニメーション中であれば完了を待ってから次の Unit の行動を始めたい
            if (!commandContext.isRunning() && RESystem.integration.onCheckVisualSequelRunning()) {
                break;
            }

            // Dialog の処理はイベント実行よりも優先する。
            // 行商人の処理など。
            if (dialogContext._hasDialogModel()) {
                dialogContext._update();

                const entity = dialogContext.causeEntity();
                if (entity) {
                    entity.immediatelyAfterAdjacentMoving = false;
                }

                if (dialogContext._hasDialogModel()) {
                    // Dialog 表示中は後続コマンドを実行しない
                    break;
                }
                else {
                    // update() で Dialog が Close された。
                    // すぐに post されたコマンドの実行を始める。
                    // こうしておかないと、移動 Sequel 開始までに 1Frame 空いてしまうため、一瞬遅延してみえてしまう。
                }
            }

            if (commandContext.isRunning()) {
                commandContext._processCommand();

                if (!commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                }

                RESystem.sequelContext.attemptFlush();
            }
            else {
                // 実行予約が溜まっているなら submit して実行開始する。
                // ※もともと callDecisionPhase() と後に毎回直接呼んでいたのだが、
                //   onTurnEnd() などもサポートしはじめて呼び出し忘れが多くなった。
                //   そもそもいつ呼び出すべきなのか分かりづらいので、submit の呼び出しは一元化する。
                if (!commandContext.isRecordingListEmpty()) {
                    commandContext._submit(); // swap
                }
            }

            if (commandContext.isRunning()) {
                // コマンド実行中。まだフェーズを進ませない
            }
            else {
                REGame.world._removeDestroyedObjects();
    
                //m_commandContext->beginCommandChain();
                this.stepSimulationInternal();
            }
        }

        this._occupy = false;
    }

    private stepSimulationInternal(): void {
        switch (this._phase) {
            case SchedulerPhase.PartStarting:
                this.update_PartStarting();
                break;
            case SchedulerPhase.RunStarting:
                this.update_RunStarting();
                break;
            case SchedulerPhase.Processing:
                this.update_ProcessPhase();
                break;
            case SchedulerPhase.RunEnding:
                this.update_RunEnding();
                break;
            case SchedulerPhase.PartEnding:
                this.update_PartEnding();
                break;
            default:
                assert(0);
                break;
        }
    }
    
    private update_PartStarting(): void {
        Log.d("========== [PartStarting] ==========");

        REGame.scheduler.buildOrderTable();
        
        // ターン開始時の各 unit の設定更新
        REGame.scheduler.units().forEach(unit => {
            const attr = unit.attr;

            // 鈍足状態の対応。待ちターン数を更新
            if (attr.speedLevel() < 0) {
                if (attr.waitTurnCount() == 0) {
                    attr.setWaitTurnCount(1);
                }
                else {
                    attr.setWaitTurnCount(attr.waitTurnCount() - 1);
                }
            }

            // 行動トークンを更新
            if (attr.waitTurnCount() == 0) {
                // 行動トークンを、速度の分だけ配る。鈍足状態でも 1 つ配る。
                // リセットではなく追加である点に注意。借金している場合に備える。
                attr.setActionTokenCount(attr.actionTokenCount() + Math.max(1, attr.speedLevel()));
            }
            else {
                // 鈍足状態。このターンは行動トークンをもらえない。
            }
        });
        
        REGame.scheduler.resetRunIndex();
        this._phase = SchedulerPhase.RunStarting;
        this._occupy = true;

        Log.d("e update_PartStarting");
    }
    
    private update_RunStarting(): void {
        Log.d("s update_RunStarting");

        REGame.scheduler._currentStep = -1;
        this._phase = SchedulerPhase.Processing;
        REGame.scheduler.resetPhaseIndex();
        this._phases[this.currentPhaseIndex()].onStart(this);

        REGame.scheduler.runs().forEach(run => {
            run.steps.forEach(step => {
                step.unit.attr._targetingEntityId = 0;
            });
        });

        Log.d("e update_RunStarting");
    }

    private prepareActionPhase(): void {
        const run = REGame.scheduler.currentRun();

        if (REGame.scheduler._currentStep < 0) {
            // 初回
            REGame.scheduler._currentStep++;
        }
        else {
            const step = run.steps[REGame.scheduler._currentStep];
            const next = step.unit.entityId.isEmpty() || REGame.world.entity(step.unit.entityId)._actionConsumed;

            // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を確認
            if (next) {
                // 行動トークンを消費する行動がとられた。または、無効化されている
                step.iterationCount--;
                this.onTurnEnd(step);
                if (step.iterationCount <= 0) {
                    REGame.scheduler._currentStep++;
                }
                else {
                    // まだ iterationCount が残っているので、同じ Step を再び実行する
                }

                if (step.unit.entityId.hasAny()) {
                    REGame.world.entity(step.unit.entityId)._actionConsumed = false;
                }
            }
            else {
                // 向き変更のみなど、行動トークンは消費しなかった
            }
        }
    }

    private update_ProcessPhase(): void {
        // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を処理
        this.prepareActionPhase();

        const phase = this._phases[this.currentPhaseIndex()];
        const run = REGame.scheduler.currentRun();
        while (true) {
            if (REGame.scheduler._currentStep >= run.steps.length) {
                REGame.scheduler._currentStep = -1;
                REGame.scheduler.advancePhaseIndex();
                if (this.currentPhaseIndex() >= this._phases.length) {
                    this._phase = SchedulerPhase.RunEnding;
                }
                else {
                    this._phases[this.currentPhaseIndex()].onStart(this);
                }
                return;
            }
            
            const step = run.steps[REGame.scheduler._currentStep];
            const unit = step.unit;
            if (phase.onProcess(this, unit)) {
                return;
            }
            else {
                // このフェーズでは実行できない step だった。次の step へ。
                REGame.scheduler._currentStep++;
            }
        }
    }

    
    
    private update_RunEnding(): void {
        const runContinue = REGame.scheduler.advanceRunIndex();
        if (runContinue) {
            this._phase = SchedulerPhase.RunStarting;
        }
        else {
            this._phase = SchedulerPhase.PartEnding;
        }
    }
    
    private update_PartEnding(): void {

        //if (RESystem.sequelContext.isEmptySequelSet()) {
        if (this._occupy) {
            // PartStart からここまで、一度もシミュレーションループから抜けなかった場合は一度制御を返すようにする。
            // こうしておかないとゲームがハングする。
            // マップにいるすべての Entity が状態異常等で行動不能な場合にこのケースが発生する。
            this._brace = true;
        }
        else {
            // ターン終了時に Sequel が残っていればすべて掃き出す
            RESystem.sequelContext.flushSequelSet();
        }

        this._phase = SchedulerPhase.PartStarting;
    }

    // 1行動トークンの消費を終えたタイミング。
    // 手番が終了し、次の人へ手番が移る直前。
    // 攻撃など、コマンドを発行し、それがすべて処理されたときに呼ばれる
    private onTurnEnd(step: RunStepInfo): void {
        REGame.scheduler.actorEntities().forEach(entity => {
            entity._callBehaviorIterationHelper(behavior => behavior.onTurnEnd(RESystem.commandContext));
        });
    }


    _foreachRunSteps(start: RunStepInfo, func: (step: RunStepInfo) => boolean) {
        const runs = REGame.scheduler.runs();
        let each = false;
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            for (let j = 0; j < run.steps.length; j++) {
                if (!each && run.steps[i] == start) {
                    each = true;
                }

                if (each) {
                    if (!func(run.steps[i])) {
                        return;
                    }
                }
            }
        }
    }
}