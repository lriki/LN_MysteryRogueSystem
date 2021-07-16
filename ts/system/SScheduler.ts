import { assert, Log, tr2 } from "../Common";
import { REGame } from "../objects/REGame";
import { RESystem } from "./RESystem";
import { SSchedulerPhase, SSchedulerPhase_AIMajorAction, SSchedulerPhase_AIMinorAction, SSchedulerPhase_CheckFeetMoved, SSchedulerPhase_ManualAction, SSchedulerPhase_Prepare, SSchedulerPhase_ResolveAdjacentAndMovingTarget } from "./SSchedulerPhase";
import { RunStepInfo } from "ts/objects/LScheduler";
import { DecisionPhase } from "ts/objects/internal";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { UAction } from "../usecases/UAction";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { REData } from "ts/data/REData";
import { UTransfer } from "ts/usecases/UTransfer";
import { UName } from "ts/usecases/UName";



enum SchedulerPhase
{
    RoundStarting,

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

    RoundEnding,
}


/**
 * see Scheduler.md
 */
export class SScheduler
{
    private _phase: SchedulerPhase = SchedulerPhase.RoundStarting;

    private _phases: SSchedulerPhase[];
    private _brace: boolean = false;
    private _occupy: boolean = false;

    

    constructor() {
        this._phases = [
            new SSchedulerPhase_Prepare(),
            new SSchedulerPhase_ManualAction(),
            new SSchedulerPhase_AIMinorAction(),
            //new SSchedulerPhase_UpdateState(),
            new SSchedulerPhase_ResolveAdjacentAndMovingTarget(),
            new SSchedulerPhase_CheckFeetMoved(),
            new SSchedulerPhase_AIMajorAction(),
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
        this._phase = SchedulerPhase.RoundStarting;
        REGame.scheduler.clear();
        Log.d("ResetScheduler");
    }

    stepSimulation(): void {
        const dialogContext = RESystem.dialogContext;
        const commandContext = RESystem.commandContext;

        while (true) {
            // フレーム待ち
            //if (REGame.scheduler.updateWaiting()) {
             //   break;
            //}

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

                if (dialogContext._hasDialogModel()) {
                    // Dialog 表示中は後続コマンドを実行しない
                    break;
                }
                else {
                    // update() で Dialog が Close された。
                    // すぐに post されたコマンドの実行を始める。
                    // こうしておかないと、移動 Sequel 開始までに 1Frame 空いてしまうため、一瞬遅延してみえてしまう。

                    const entity = dialogContext.causeEntity();
                    if (entity) {
                        entity.immediatelyAfterAdjacentMoving = false;
                    }
                }
            }

            if (commandContext.isRunning()) {
                commandContext._processCommand();

                if (!commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                    this.onCommandChainConsumed();
                }

                RESystem.sequelContext.attemptFlush();
            }
            else {
                // 実行予約が溜まっているなら submit して実行開始する。
                // ※もともと callDecisionPhase() と後に毎回直接呼んでいたのだが、
                //   onTurnEnd() などもサポートしはじめて呼び出し忘れが多くなった。
                //   そもそもいつ呼び出すべきなのか分かりづらいので、submit の呼び出しは一元化する。
                //if (!commandContext.isRecordingListEmpty()) {
                //    commandContext._submit(); // swap
                //}
                assert(commandContext.isRecordingListEmpty());

                
                REGame.world._removeDestroyedObjects();
    
                this.stepSimulationInternal();
            }
        }

        this._occupy = false;
    }

    private stepSimulationInternal(): void {
        switch (this._phase) {
            case SchedulerPhase.RoundStarting:
                this.update_RoundStarting();
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
            case SchedulerPhase.RoundEnding:
                this.update_RoundEnding();
                break;
            default:
                assert(0);
                break;
        }
    }
    
    private update_RoundStarting(): void {
        Log.d("========== [RoundStarting] ==========");

        // 敵の生成など
        RESystem.mapManager.updateRound();

        REGame.scheduler.buildOrderTable();
        
        // ターン開始時の各 unit の設定更新
        REGame.scheduler.units().forEach(unit => {
            const behavior = unit.behavior;
            const entity = REGame.world.entity(unit.entityId);

            // 鈍足状態の対応。待ちターン数を更新
            if (behavior.speedLevel() < 0) {
                if (behavior.waitTurnCount() == 0) {
                    behavior.setWaitTurnCount(1);
                }
                else {
                    behavior.setWaitTurnCount(behavior.waitTurnCount() - 1);
                }
            }

            // 行動トークンを更新
            if (behavior.waitTurnCount() == 0) {
                // 行動トークンを、速度の分だけ配る。鈍足状態でも 1 つ配る。
                // リセットではなく追加である点に注意。借金している場合に備える。
                entity.setActionTokenCount(entity.actionTokenCount() + Math.max(1, behavior.speedLevel()));
            }
            else {
                // 鈍足状態。このターンは行動トークンをもらえない。
            }
        });
        
        REGame.scheduler.resetRunIndex();
        this._phase = SchedulerPhase.RunStarting;
        this._occupy = true;

        Log.d("e update_RoundStarting");
    }
    
    private update_RunStarting(): void {
        Log.d("s update_RunStarting");

        REGame.scheduler._currentStep = -1;
        this._phase = SchedulerPhase.Processing;
        REGame.scheduler.resetPhaseIndex();
        this._phases[this.currentPhaseIndex()].onStart(this);

        REGame.scheduler.runs().forEach(run => {
            run.steps.forEach(step => {
                step.unit.behavior._targetingEntityId = 0;
            });
        });

        Log.d("e update_RunStarting");
    }

    private prepareActionPhase(): void {
        assert(!RESystem.commandContext.isRunning());
        const run = REGame.scheduler.currentRun();

        if (REGame.scheduler._currentStep < 0) {
            // 初回
            REGame.scheduler._currentStep++;
        }
        else {
            const step = run.steps[REGame.scheduler._currentStep];
            const next = true;//step.unit.entityId.isEmpty() || REGame.world.entity(step.unit.entityId)._actionConsumed;

            // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を確認
            if (next) {
                // 行動トークンを消費する行動がとられた。または、無効化されている
                step.iterationCount--;
                this.onStepEnd(step);
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
        // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上のコマンドチェーンの結果を処理
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
            phase.onProcess(this, unit);

            if (RESystem.commandContext.isRunning()) {
                // onProcess で何かコマンドが積まれていたらそれを実行しに行く
                return;
            }
            else {
                //this.onTurnEnd(step);
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

            {
                REGame.map.increaseRoundCount();
                if (REGame.map.roundCount() >= REData.system.floorRoundLimit) {
                    const entity = REGame.camera.focusedEntity();
                    if (entity) {
                        RESystem.commandContext.postMessage(tr2("地震だ！\\|"));
                        RESystem.commandContext.postMessage(tr2("%1は地割れに飲み込まれた！").format(UName.makeUnitNameByFocused(entity)));
                        RESystem.commandContext.postSequel(entity, RESystem.sequels.earthquake2);
                        RESystem.commandContext.postWait(entity, 60);
                        RESystem.commandContext.postCall(() => { UTransfer.proceedFloorForward(); });
                    }
                }
            }

            this._phase = SchedulerPhase.RoundEnding;
        }
    }
    
    private update_RoundEnding(): void {

        //if (RESystem.sequelContext.isEmptySequelSet()) {
        if (this._occupy) {
            // RoundStart からここまで、一度もシミュレーションループから抜けなかった場合は一度制御を返すようにする。
            // こうしておかないとゲームがハングする。
            // マップにいるすべての Entity が状態異常等で行動不能な場合にこのケースが発生する。
            this._brace = true;
        }
        else {
            // ターン終了時に Sequel が残っていればすべて掃き出す
            RESystem.sequelContext.flushSequelSet();
        }

        this._phase = SchedulerPhase.RoundStarting;
    }

    // 遅延予約済みのコマンドすべて実行し終え、次のフェーズに進もうとしている状態。
    // ここで新たにコマンドを post すると、フェーズは進まず新たなコマンドチェーンを開始できる。
    private onCommandChainConsumed(): void {
        // stabilEntities
        // 本来あるべき状態と齟齬がある Entity を、定常状態へ矯正する。
        {
            for (const entity of REGame.map.entities()) {
                const block = REGame.map.block(entity.x, entity.y);
                const currentLayer = block.findEntityLayerKind(entity);
                assert(currentLayer);
                const homeLayer = entity.getHomeLayer();
                if (currentLayer != homeLayer) {
                    UAction.postDropOrDestroy(RESystem.commandContext, entity, homeLayer, 0);
                }
            }
        }
    }

    // 1行動トークンの消費を終えたタイミング。
    // 手番が終了し、次の人へ手番が移る直前。
    // 攻撃など、コマンドを発行し、それがすべて処理されたときに呼ばれる
    private onStepEnd(step: RunStepInfo): void {

        REGame.scheduler.actorEntities().forEach(entity => {
            entity._callBehaviorIterationHelper(behavior => behavior.onStepEnd(RESystem.commandContext));
        });

        
        const unit = step.unit;
        if (unit.entityId.hasAny()) {
            const entity = REGame.world.entity(unit.entityId);



            entity._effectResult.showResultMessagesDeferred(RESystem.commandContext, entity);
            entity._effectResult.clear();
        }
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
