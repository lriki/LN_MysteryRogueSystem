import { assert, Log, tr2 } from "../Common";
import { REGame } from "../objects/REGame";
import { RESystem } from "./RESystem";
import { SSchedulerPhase_AIMajorAction, SSchedulerPhase_AIMinorAction, SSchedulerPhase_CheckFeetMoved, SSchedulerPhase_ManualAction, SSchedulerPhase_ResolveAdjacentAndMovingTarget } from "./SSchedulerPhaseImpl";
import { UAction } from "../usecases/UAction";
import { REData } from "ts/re/data/REData";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { UName } from "ts/re/usecases/UName";
import { LScheduler, LScheduler2, LSchedulerPhase, LTOStep } from "ts/re/objects/LScheduler";
import { REBasics } from "../data/REBasics";
import { SStepPhase } from "./SCommon";
import { SStepScheduler, SStepScheduler2 } from "./SStepScheduler";




export class SScheduler {
    private _data: LScheduler2;
    private _stepScheduler: SStepScheduler2;
    private _brace: boolean;
    private _occupy: boolean;

    public constructor() {
        this._data = REGame.scheduler;
        this._stepScheduler = new SStepScheduler2(this);
        this._brace = false;
        this._occupy = false;
    }

    public reset(): void {
        this._data = REGame.scheduler;
        this._data.chedulerPhase = LSchedulerPhase.RoundStarting;
        this._brace = false;
        this._occupy = false;
    }

    public data(): LScheduler2 {
        return this._data;
    }

    public stepSimulation(): void {
        const dialogContext = RESystem.dialogContext;
        const commandContext = RESystem.commandContext;

        while (true) {
            // フレーム待ち
            //if (REGame.scheduler.updateWaiting()) {
             //   break;
            //}

            // Sequel 終了待ち
            if (RESystem.integration.checkVisualSequelRunning()) {
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
            if (!commandContext.isRunning() && RESystem.integration.checkVisualSequelRunning()) {
                break;
            }


            // Dialog 表示中でも update を抜けた時に詰まれているコマンドは実行されるようにしたい。
            // 向き変更なども Activity 化しておかないと、行動履歴が付けづらい。
            // そのため Dialog の update 前に Command 実行しておく。
            if (commandContext.isRunning()) {
                commandContext._processCommand();

                if (!commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                    this.onCommandChainConsumed();
                }

                RESystem.sequelContext.attemptFlush(false);
                continue;
            }
            

            let continue_cc = true;
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
                    continue_cc = false;
                }
            }
            
            if (continue_cc)
            {
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
        switch (this._data.chedulerPhase) {
            case LSchedulerPhase.RoundStarting:
                this.update_RoundStarting();
                break;
            case LSchedulerPhase.Processing:
                this.update_ProcessPhase();
                break;
            case LSchedulerPhase.RoundEnding:
                this.update_RoundEnding();
                break;
            default:
                throw new Error("Unreachable.");
        }
    }

    private update_RoundStarting(): void {
        // 敵の生成など
        RESystem.mapManager.updateRound();

        this._data.buildSchedulingUnits();
        this._data.dealActionTokens();
        this._data.chedulerPhase = LSchedulerPhase.Processing
        this._occupy = true;
        this._stepScheduler.start();
    }
    
    private update_ProcessPhase(): void {
        if (!this._stepScheduler.process()) {
            this._data.chedulerPhase = LSchedulerPhase.RoundEnding;
        }
    }

    private update_RoundEnding(): void {

        //if (RESystem.sequelContext.isEmptySequelSet()) {
        if (this._occupy) {
            // RoundStart からここまで、一度もシミュレーションループから抜けなかった場合は一度制御を返すようにする。
            // こうしておかないとゲームがハングする。
            // マップにいるすべての Entity が状態異常等で行動不能な場合にこのケースが発生する。

            // マップ侵入後、方向キーを押しっぱなしにしておくと、Player の Move モーションが再生されず進行方向にワープしたように見えてしまう問題の対策。
            // 普通であれば ManualDialog が表示されている間はシミュレーションループは回らないので stepSimulation() から制御が返るが、
            // 押しっぱなしの場合 Dialog 表示→ キー入力判定 → 移動処理 → postSequel() が一気に行われる。
            // そのため RoundStarting → RoundEnding まで一度も制御を返さず来てしまうため、brace = true となり、1フレームだけ Idle Sequel を再生する猶予ができてしまった。
            if (RESystem.sequelContext.isEmptySequelSet()) {
                this._brace = true;
            }
        }
        else {
            // ターン終了時に Sequel が残っていればすべて掃き出す
            RESystem.sequelContext.flushSequelSet();
        }

        this._data.chedulerPhase = LSchedulerPhase.RoundStarting
    }

    // 遅延予約済みのコマンドすべて実行し終え、次のフェーズに進もうとしている状態。
    // ここで新たにコマンドを post すると、フェーズは進まず新たなコマンドチェーンを開始できる。
    private onCommandChainConsumed(): void {
        this.stabilizeSituation();
    }

    // 本来あるべき状態と齟齬がある Entity を、定常状態へ矯正する。
    private stabilizeSituation(): void {

        {
            for (const entity of REGame.map.entities()) {
                const block = REGame.map.block(entity.x, entity.y);
                const currentLayer = block.findEntityLayerKind(entity);
                assert(currentLayer);
                const homeLayer = entity.getHomeLayer();
                if (currentLayer != homeLayer) {
                    UAction.postDropOrDestroyOnCurrentPos(RESystem.commandContext, entity, homeLayer);
                }
            }
        }
        
        for (const entity of REGame.map.entities()) {
            entity.iterateBehaviorsReverse(b => {
                b.onStabilizeSituation(entity, RESystem.commandContext);
                return true;
            });
        }
    }
}













enum SchedulerPhase_old
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
export class SScheduler_old
{
    private _phase: SchedulerPhase_old = SchedulerPhase_old.RoundStarting;

    private _stepScheduler: SStepScheduler = new SStepScheduler(this);
    private _brace: boolean = false;
    private _occupy: boolean = false;

    

    constructor() {
    }

    // マップ切り替え時など。
    // DialogContext はクリアしない。RMMZ イベント実行のための Dialog が動いている可能性があるため。
    clear() {
        RESystem.sequelContext.clear();
        RESystem.commandContext.clear();
        this._phase = SchedulerPhase_old.RoundStarting;
        REGame.scheduler_old.clear();
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
            if (RESystem.integration.checkVisualSequelRunning()) {
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
            if (!commandContext.isRunning() && RESystem.integration.checkVisualSequelRunning()) {
                break;
            }


            // Dialog 表示中でも update を抜けた時に詰まれているコマンドは実行されるようにしたい。
            // 向き変更なども Activity 化しておかないと、行動履歴が付けづらい。
            // そのため Dialog の update 前に Command 実行しておく。
            if (commandContext.isRunning()) {
                commandContext._processCommand();

                if (!commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                    this.onCommandChainConsumed();
                }

                RESystem.sequelContext.attemptFlush(false);
                continue;
            }
            

            let continue_cc = true;
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
                    continue_cc = false;
                }
            }
            
            if (continue_cc)
            {
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
            case SchedulerPhase_old.RoundStarting:
                this.update_RoundStarting();
                break;
            case SchedulerPhase_old.RunStarting:
                this.update_RunStarting();
                break;
            case SchedulerPhase_old.Processing:
                this.update_ProcessPhase();
                break;
            case SchedulerPhase_old.RunEnding:
                this.update_RunEnding();
                break;
            case SchedulerPhase_old.RoundEnding:
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

        REGame.scheduler_old.buildOrderTable();
        
        // ターン開始時の各 unit の設定更新
        REGame.scheduler_old.units2().forEach(unit => {
            const behavior = unit.behavior();
            const entity = unit.entity();

            const speedLevel = REGame.scheduler_old.getSpeedLevel(entity);

            // 鈍足状態の対応。待ちターン数を更新
            if (speedLevel < 0) {
                if (behavior.waitTurnCount() == 0) {
                    behavior.setWaitTurnCount(1);
                }
                else {
                    behavior.setWaitTurnCount(behavior.waitTurnCount() - 1);
                }
            }

            // 行動トークンを更新
            if (behavior.waitTurnCount() == 0) {
                // 行動トークンを、速度の分だけ配る。
                entity._actionToken.reset(entity, Math.max(1, speedLevel));
            }
            else {
                // 鈍足状態。このターンは行動トークンをもらえない。
            }
        });
        
        REGame.scheduler_old.resetRunIndex();
        this._phase = SchedulerPhase_old.RunStarting;
        this._occupy = true;

        Log.d("e update_RoundStarting");
    }
    
    private update_RunStarting(): void {
        Log.d("s update_RunStarting");

        this._phase = SchedulerPhase_old.Processing;
        this._stepScheduler.startRun();

        REGame.scheduler_old.runs().forEach(run => {
            run.steps.forEach(step => {
                if (step.isValid()) {
                    step.unit().behavior()._targetingEntityId = 0;
                    // const entity = step.unit().entity();
                    // step.startingActionTokenCount = entity.actionTokenCount();
                }
            });
        });

        Log.d("e update_RunStarting");
    }


    private update_ProcessPhase(): void {
        if (!this._stepScheduler.process()) {
            this._phase = SchedulerPhase_old.RunEnding;
        }
    }

    
    
    private update_RunEnding(): void {
        const runContinue = REGame.scheduler_old.advanceRunIndex();
        if (runContinue) {
            this._phase = SchedulerPhase_old.RunStarting;
        }
        else {

            {
                REGame.map.increaseRoundCount();
                if (REGame.map.roundCount() >= REData.system.floorRoundLimit) {
                    const entity = REGame.camera.focusedEntity();
                    if (entity) {
                        RESystem.commandContext.postMessage(tr2("地震だ！\\|"));
                        RESystem.commandContext.postMessage(tr2("%1は地割れに飲み込まれた！").format(UName.makeUnitName(entity)));
                        RESystem.commandContext.postSequel(entity, REBasics.sequels.earthquake2);
                        RESystem.commandContext.postWait(entity, 60);
                        RESystem.commandContext.postCall(() => { UTransfer.proceedFloorForwardForPlayer(); });
                    }
                }
            }

            this._phase = SchedulerPhase_old.RoundEnding;
        }
    }
    
    private update_RoundEnding(): void {

        //if (RESystem.sequelContext.isEmptySequelSet()) {
        if (this._occupy) {
            // RoundStart からここまで、一度もシミュレーションループから抜けなかった場合は一度制御を返すようにする。
            // こうしておかないとゲームがハングする。
            // マップにいるすべての Entity が状態異常等で行動不能な場合にこのケースが発生する。

            // マップ侵入後、方向キーを押しっぱなしにしておくと、Player の Move モーションが再生されず進行方向にワープしたように見えてしまう問題の対策。
            // 普通であれば ManualDialog が表示されている間はシミュレーションループは回らないので stepSimulation() から制御が返るが、
            // 押しっぱなしの場合 Dialog 表示→ キー入力判定 → 移動処理 → postSequel() が一気に行われる。
            // そのため RoundStarting → RoundEnding まで一度も制御を返さず来てしまうため、brace = true となり、1フレームだけ Idle Sequel を再生する猶予ができてしまった。
            if (RESystem.sequelContext.isEmptySequelSet()) {
                this._brace = true;
            }
        }
        else {
            // ターン終了時に Sequel が残っていればすべて掃き出す
            RESystem.sequelContext.flushSequelSet();
        }

        this._phase = SchedulerPhase_old.RoundStarting;
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
                    UAction.postDropOrDestroyOnCurrentPos(RESystem.commandContext, entity, homeLayer);
                }
            }
        }
    }


    _foreachRunSteps(start: LTOStep, func: (step: LTOStep) => boolean) {
        const runs = REGame.scheduler_old.runs();
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
