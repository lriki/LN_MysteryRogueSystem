import { assert, Log } from "../Common";
import { RECommandContext } from "./RECommandContext";
import { REData } from "../data/REData";
import { REDialog, REDialogContext } from "./REDialog";
import { REGame } from "../RE/REGame";
import { REGameManager } from "./REGameManager";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { DecisionPhase } from "../RE/REGame_Behavior";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REResponse } from "./RECommand";
import { REGame_Sequel, RESequelSet } from "ts/RE/REGame_Sequel";
import { RESystem } from "./RESystem";


export interface UnitInfo
{
    entity: REGame_Entity | undefined;	        // 一連の実行中に Collapse などで map から消えたりしたら null になる
    attr: REGame_UnitAttribute;     // cache for avoiding repeated find.
    actionCount: number;    // 行動順リストを作るための一時変数。等速の場合は1,倍速の場合は2.x
}

export interface RunStepInfo
{
    unit: UnitInfo;         // 行動させたい unit
    iterationCount: number;    // 何回連続行動できるか。Run のマージなどで 0 になることもある。
};

export interface RunInfo
{
    steps: RunStepInfo[];
};

enum SchedulerPhase
{
    PartStarting,

    RunStarting,

    /**
     * マニュアル入力
     * Dialog が close すると、次の Phase に進む。
     */
    ManualAction,

    /**
     * AI 行動フェーズ 1
     * モンスターの移動・攻撃対象決定
     */
    AIMinorAction,

    /**
     * AI 行動フェーズ 2
     */
    AIMajorAction,

    RunEnding,

    PartEnding,
}


/**
 * see Scheduler.md
 */
export class REScheduler
{
    private _commandContext: RECommandContext;
    //rivate _dialogModel: REDialog | undefined;
    private _dialogContext: REDialogContext;

    private _phase: SchedulerPhase = SchedulerPhase.PartStarting;
    private _actorEntities: REGame_Entity[] = [];   // Part 中に行動する全 Entity
    private _units: UnitInfo[] = [];
    private _runs: RunInfo[] = [];
    private _currentRun: number = 0;
    private _currentStep: number = 0;
    private _sequelSet: RESequelSet = new RESequelSet();

    _actionConsumed: boolean = false;
    
    /**  */
    public signalFlushSequelSet: ((sequelSet: RESequelSet) => void) | undefined;

    constructor() {
        this._commandContext = new RECommandContext(this);
        this._dialogContext = new REDialogContext(this, this._commandContext);
    }

    commandContext(): RECommandContext {
        return this._commandContext;
    }

    actionScheduleTable(): RunInfo[] {
        return this._runs;
    }

    stepSimulation(): void {
        while (true) {
            // Sequel 終了待ち
            if (RESystem.integration.onCheckVisualSequelRunning()) {
                // Sequel 実行中
                
                break;
            }
            /*
            if (this._commandContext.visualAnimationWaiting()) {
                if (RESystem.integration.onCheckVisualSequelRunning()) {
                    // Sequel 実行中
                    break;
                }
                else {
                    // Sequel 終了
                    this._commandContext.clearVisualAnimationWaiting();
                }
            }
            */

            // 現在のコマンドリストの実行は終了しているが、Visual 側がアニメーション中であれば完了を待ってから次の Unit の行動を始めたい
            if (!this._commandContext.isRunning() && RESystem.integration.onCheckVisualSequelRunning()) {
                break;
            }

            // Dialog の処理はイベント実行よりも優先する。
            // 行商人の処理など。
            if (this._dialogContext._hasDialogModel()) {
                this._dialogContext._update();

                const entity = this._dialogContext.causeEntity();
                if (entity) {
                    entity.immediatelyAfterAdjacentMoving = false;
                }

                if (this._dialogContext._hasDialogModel()) {
                    // Dialog 表示中は後続コマンドを実行しない
                    break;
                }
                else {
                    // update() で Dialog が Close された。
                    // すぐに post されたコマンドの実行を始める。
                    // こうしておかないと、移動 Sequel 開始までに 1Frame 空いてしまうため、一瞬遅延してみえてしまう。
                }
            }

            if (this._commandContext.isRunning()) {
                this._commandContext._processCommand();

                if (!this._commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                }

                // 攻撃などのメジャーアクションで同期的　Sequel が post されていれば flush.
                // もし歩行など並列のみであればあとでまとめて実行したので不要。
                if (!this._sequelSet.isAllParallel()) {
                    this.flushSequelSet();
                }
            }

            if (this._commandContext.isRunning()) {
                // コマンド実行中。まだフェーズを進ませない
            }
            else {
                REGame.world._removeDestroyesEntities();
    
                //m_commandContext->beginCommandChain();
                this.stepSimulationInternal();
            }

        }
    }

    private stepSimulationInternal(): void {
        switch (this._phase) {
            case SchedulerPhase.PartStarting:
                this.update_PartStarting();
                break;
            case SchedulerPhase.RunStarting:
                this.update_RunStarting();
                break;
            case SchedulerPhase.ManualAction:
                this.update_ManualAction();
                break;
            case SchedulerPhase.AIMinorAction:
                this.update_AIMinorAction();
                break;
            case SchedulerPhase.AIMajorAction:
                this.update_AIMajorAction();
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

        this.buildOrderTable();
        
        // ターン開始時の各 unit の設定更新
        this._units.forEach(unit => {
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
        
        this._currentRun = 0;
        this._phase = SchedulerPhase.RunStarting;

        Log.d("e update_PartStarting");
    }
    
    private update_RunStarting(): void {
        Log.d("s update_RunStarting");

        this._currentStep = -1;
        this._phase = SchedulerPhase.ManualAction;

        this._runs.forEach(run => {
            run.steps.forEach(step => {
                step.unit.attr._targetingEntityId = 0;
            });
        })

        Log.d("e update_RunStarting");
    }

    
    consumeActionToken(entity: REGame_Entity): void {
        const attr = entity.findAttribute(REGame_UnitAttribute);
        assert(attr);
        attr.setActionTokenCount(attr.actionTokenCount() - 1);  // ここで借金することもあり得る
        //this.nextActionUnit();
        this._actionConsumed = true;
    }

    /*
    nextActionUnit() {
        const run = this._runs[this._currentRun];
        const step = run.steps[this._currentStep];

        if (this._phase == SchedulerPhase.AIMinorAction && step.unit.attr._targetingEntityId > 0) {
            // 
            this._currentStep++;
        }
        else {
            if (step.iterationCount > 0) {
                step.iterationCount--;
                console.log("decl iterationCount:", step.iterationCount, step.unit.unit?._name);
                console.trace();
            }
            
            if (step.iterationCount <= 0) {
                this._currentStep++;
            }
        }
        

    }
    */
    

    private prepareActionPhase(): void {
        const run = this._runs[this._currentRun];

        if (this._currentStep < 0) {
            // 初回
            this._currentStep++;
        }
        else {
            // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を確認
            if (this._actionConsumed) {
                // 行動トークンを消費する行動がとられた。
                const step = run.steps[this._currentStep];
                step.iterationCount--;
                this.onTurnEnd(step);
                if (step.iterationCount <= 0) {
                    this._currentStep++;
                }
                else {
                    // まだ iterationCount が残っているので、同じ Step を再び実行する
                }
            }
            else {
                // 向き変更のみなど、行動トークンは消費しなかった
            }
        }
    }

    private update_ManualAction(): void {
        // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を処理
        this.prepareActionPhase();

        const run = this._runs[this._currentRun];
        while (true) {
            if (this._currentStep >= run.steps.length) {
                this._currentStep = -1;
                this._phase = SchedulerPhase.AIMinorAction;
                return;
            }
            
            const step = run.steps[this._currentStep];
            const unit = step.unit;
            if (unit.entity && unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
                unit.entity._callDecisionPhase(this._commandContext, DecisionPhase.Manual);
                this._commandContext._submit(); // swap
                return;
            }
            else {
                // このフェーズでは実行できない step だった。次の step へ。
                this._currentStep++;
            }
        }
    }
    
    private update_AIMinorAction(): void {
        // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を処理
        this.prepareActionPhase();

        const run = this._runs[this._currentRun];
        while (true) {
            if (this._currentStep >= run.steps.length) {
                this._currentStep = -1;
                this._phase = SchedulerPhase.AIMajorAction;
                return;
            }
            
            const step = run.steps[this._currentStep];
            const unit = step.unit;
            if (unit.entity && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0 &&
                unit.attr._targetingEntityId <= 0) {    // Minor では行動対象決定の判定も見る
                unit.entity._callDecisionPhase(this._commandContext, DecisionPhase.AIMinor);
                this._commandContext._submit(); // swap
                return;
            }
            else {
                // このフェーズでは実行できない step だった。次の step へ。
                this._currentStep++;
            }
        }
    }
    
    private update_AIMajorAction(): void {
        // ひとつ前の callDecisionPhase() を基点に実行された 1 つ以上ののコマンドチェーンの結果を処理
        this.prepareActionPhase();

        const run = this._runs[this._currentRun];
        while (true) {
            if (this._currentStep >= run.steps.length) {
                this._currentStep = -1;
                this._phase = SchedulerPhase.RunEnding;
                return;
            }
            
            const step = run.steps[this._currentStep];
            const unit = step.unit;
            if (unit.entity && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
                unit.entity._callDecisionPhase(this._commandContext, DecisionPhase.AIMajor);
                this._commandContext._submit(); // swap
                return;
            }
            else {
                // このフェーズでは実行できない step だった。次の step へ。
                this._currentStep++;
            }
        }
    }
    
    private update_RunEnding(): void {
        console.log("update_RunEnding");
        this._currentRun++;
        if (this._currentRun >= this._runs.length) {
            this._phase = SchedulerPhase.PartEnding;
        }
        else {
            this._phase = SchedulerPhase.RunStarting;
        }
    }
    
    private update_PartEnding(): void {
        console.log("update_PartEnding flushSequelSet");

        // ターン終了時に Sequel が残っていればすべて掃き出す
        this.flushSequelSet();

        this._phase = SchedulerPhase.PartStarting;
    }

    // 1行動トークンの消費を終えたタイミング。
    // 手番が終了し、次の人へ手番が移る直前。
    // 攻撃など、コマンドを発行し、それがすべて処理されたときに呼ばれる
    private onTurnEnd(step: RunStepInfo): void {
        this._actorEntities.forEach(entity => {
            entity._callBehaviorIterationHelper(behavior => behavior.onTurnEnd(this._commandContext));
        });
    }

    private buildOrderTable(): void {
        this._actorEntities = [];
        this._units = [];

        let runCount = 0;

        // 行動できるすべての entity を集める
        {
            REGame.map.entities().forEach(entity => {
                const attr = entity.findAttribute(REGame_UnitAttribute);
                if (attr) {
                    assert(attr.factionId() > 0);
                    assert(attr.speedLevel() != 0);

                    let actionCount = attr.speedLevel();
                    
                    // 鈍足状態の対応
                    if (actionCount < 0) {
                        actionCount = 1;
                    }

                    this._units.push({
                        entity: entity,
                        attr: attr, 
                        actionCount: actionCount
                    });

                    // このターン内の最大行動回数 (phase 数) を調べる
                    runCount = Math.max(runCount, actionCount);

                    this._actorEntities.push(entity);
                }
            });
        }

        // 勢力順にソート
        this._units = this._units.sort((a, b) => { return REData.factions[a.attr.factionId()].schedulingOrder - REData.factions[b.attr.factionId()].schedulingOrder; });

        this._runs = new Array(runCount);
        for (let i = 0; i < this._runs.length; i++) {
            this._runs[i] = { steps: []};
        }

        // Faction にかかわらず、マニュアル操作 Unit は最優先で追加する
        this._units.forEach(unit => {
            if (unit.attr.manualMovement()) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].steps.push({
                        unit: unit,
                        iterationCount: 1,
                    });
                }
            }
        });

        // 次は倍速以上の NPC. これは前から詰めていく。
        this._units.forEach(unit => {
            if (!unit.attr.manualMovement() && unit.actionCount >= 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].steps.push({
                        unit: unit,
                        iterationCount: 1,
                    });
                }
            }
        });

        // 最後に等速以下の NPC を後ろから詰めていく
        this._units.forEach(unit => {
            if (!unit.attr.manualMovement() && unit.actionCount < 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[this._runs.length - 1 - i].steps.push({  	// 後ろから詰めていく
                        unit: unit,
                        iterationCount: 1,
                    });
                }
            }
        });

        //console.log("unis:", this._units);
        //console.log("runs:", this._runs);

        // Merge
        {
            const flatSteps = this._runs.flatMap(x => x.steps);
    
            for (let i1 = flatSteps.length - 1; i1 >= 0; i1--) {
                const step1 = flatSteps[i1];
    
                // step1 の前方を検索
                for (let i2 = i1 - 1; i2 >= 0; i2--) {
                    const step2 = flatSteps[i2];
    
                    if (step2.unit.attr.factionId() != step1.unit.attr.factionId()) {
                        // 別勢力の行動予定が見つかったら終了
                        break;
                    }
    
                    if (step2.unit.entity == step1.unit.entity) {
                        // 勢力をまたがずに同一 entity の行動予定が見つかったら、
                        // そちらへ iterationCount をマージする。
                        step2.iterationCount += step1.iterationCount;
                        step1.iterationCount = 0;
                        break;
                    }
                }
            }
        }
    }

    invalidateEntity(entity: REGame_Entity) {
        const index = this._units.findIndex(x => x.entity == entity);
        if (index >= 0) {
            console.log("invalidate", entity);
            this._units[index].entity = undefined;
            
            this._actorEntities = this._actorEntities.filter(x => x != entity);
        }
    }

    _foreachRunSteps(start: RunStepInfo, func: (step: RunStepInfo) => boolean) {
        let each = false;
        for (let i = 0; i < this._runs.length; i++) {
            const run = this._runs[i];
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

    _openDialogModel(causeEntity: REGame_Entity, value: REDialog) {
        this._dialogContext.setCauseEntity(causeEntity);
        this._dialogContext._setDialogModel(value);
        RESystem.integration.onDialogOpend(this._dialogContext);
        //const visual = 
        //this._dialogContext._visual = visual;
    }

    _closeDialogModel() {
        this._dialogContext._setDialogModel(null);
        //if (this._dialogContext._visual) {
        //    this._dialogContext._visual.onClose();
        //    this._dialogContext._visual = undefined;
        //}
        RESystem.integration.onDialogClosed(this._dialogContext);
    }

    _getDialogContext() {
        return this._dialogContext;
    }

    addSequel(sequel: REGame_Sequel) {
        this._sequelSet.addSequel(sequel);
    }

    flushSequelSet() {
        Log.d("[FlushSequel]");

        if (!this._sequelSet.isEmpty()) {
            if (this.signalFlushSequelSet) {
                this.signalFlushSequelSet(this._sequelSet);
            }
            RESystem.integration.onFlushSequelSet(this._sequelSet);

            this._sequelSet = new RESequelSet();
        }
    }

}
