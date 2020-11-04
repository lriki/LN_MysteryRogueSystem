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


export interface UnitInfo
{
    unit: REGame_Entity | undefined;	        // 一連の実行中に Collapse などで map から消えたりしたら null になる
    attr: REGame_UnitAttribute;     // cache for avoiding repeated find.
    actionCount: number;    // 行動順リストを作るための一時変数。等速の場合は1,倍速の場合は2.x
}

export interface ActionInfo
{
    unit: UnitInfo;         // 行動させたい unit
    actionCount: number;    // 何回連続行動するか。Run のマージなどで 0 になることもある。
};

export interface RunInfo
{
    actions: ActionInfo[];
};

enum SchedulerPhase
{
    TurnStarting,

    RunStarting,

    /**
     * マニュアル入力
     * Dialog が close すると、次の Phase に進む。
     */
    ManualAction,

    /**
     * AI 行動フェーズ 1
     */
    AIMinorAction,

    /**
     * AI 行動フェーズ 2
     */
    AIMajorAction,

    RunEnding,

    TurnEnding,
}


/**
 * see Scheduler.md
 */
export class REScheduler
{
    private _commandContext: RECommandContext;
    //rivate _dialogModel: REDialog | undefined;
    private _dialogContext: REDialogContext;

    private _phase: SchedulerPhase = SchedulerPhase.TurnStarting;
    private _units: UnitInfo[] = [];
    private _runs: RunInfo[] = [];
    private _currentRun: number = 0;
    private _currentUnit: number = 0;
    private _sequelSet: RESequelSet = new RESequelSet();
    
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
            if (REGame.integration.onCheckVisualSequelRunning()) {
                // Sequel 実行中
                
                break;
            }
            /*
            if (this._commandContext.visualAnimationWaiting()) {
                if (REGame.integration.onCheckVisualSequelRunning()) {
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
            if (!this._commandContext.isRunning() && REGame.integration.onCheckVisualSequelRunning()) {
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
                //sweepCollapseList();
    
                //m_commandContext->beginCommandChain();
                this.stepSimulationInternal();
            }

        }
    }

    private stepSimulationInternal(): void {
        switch (this._phase) {
            case SchedulerPhase.TurnStarting:
                this.update_TurnStarting();
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
            case SchedulerPhase.TurnEnding:
                this.update_TurnEnding();
                break;
            default:
                assert(0);
                break;
        }
    }
    
    private update_TurnStarting(): void {
        Log.d("========== [TurnStarting] ==========");

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

        Log.d("e update_TurnStarting");
    }
    
    private update_RunStarting(): void {
        Log.d("s update_RunStarting");

        this._currentUnit = 0;
        this._phase = SchedulerPhase.ManualAction;

        Log.d("e update_RunStarting");
    }

    
    consumeActionToken(entity: REGame_Entity): void {
        const attr = entity.findAttribute(REGame_UnitAttribute);
        assert(attr);
        attr.setActionTokenCount(attr.actionTokenCount() - 1);  // ここで借金することもあり得る
        this.nextActionUnit();
    }

    nextActionUnit() {
        //const run = this._runs[this._currentRun];

        // 全 Unit 分処理を終えたら次の Phase へ
        this._currentUnit++;
        /*
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;

            switch (this._phase) {
                case SchedulerPhase.ManualAction:
                    this._phase = SchedulerPhase.AIMinorAction;
                    break;
                case SchedulerPhase.AIMinorAction:
                    this._phase = SchedulerPhase.AIMajorAction;
                    break;
                case SchedulerPhase.AIMinorAction:
                    this._phase = SchedulerPhase.RunEnding;
                    break;
                default:
                    assert(0);
                    break;
            }
            
            return false;
        }
        else {
            return true;
        }
        */
    }
    
    private update_ManualAction(): void {

        const run = this._runs[this._currentRun];
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.AIMinorAction;
            return;
        }


        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        if (unit.unit && unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            unit.unit._callDecisionPhase(this._commandContext, DecisionPhase.Manual);
            

            // swap
            this._commandContext._submit();
        }
        else {
            this.nextActionUnit();
        }
    }
    
    private update_AIMinorAction(): void {
        const run = this._runs[this._currentRun];
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.AIMajorAction;
            return;
        }

        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        if (unit.unit && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {

            const response = unit.unit._callDecisionPhase(this._commandContext, DecisionPhase.AIMinor);
            if (response == REResponse.Consumed) {
                // CommandContext.postConsumeActionToken() などで行動消費することを期待する
                this._commandContext._submit();
            }
            else {
                // 何も行動しなかった
                this.consumeActionToken(unit.unit);
            }
        }
        else {
            // このフェーズで行動決定するべき Entity ではなかった。そのままフェーズを進める。
            this.nextActionUnit();
        }


        // 全 Unit 分処理を終えたら次の Phase へ
        //this._currentUnit++;
        //if (this._currentUnit >= run.actions.length) {
        //    this._currentUnit = 0;
        //    this._phase = SchedulerPhase.AIMajorAction;
        //}
    }
    
    private update_AIMajorAction(): void {
        const run = this._runs[this._currentRun];
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.RunEnding;
            return;
        }

        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        let consumed = false;
        if (unit.unit && !unit.attr.manualMovement() && unit.attr.actionTokenCount() > 0) {
            const response = unit.unit._callDecisionPhase(this._commandContext, DecisionPhase.AIMajor);
            if (response == REResponse.Consumed) {
                // CommandContext.postConsumeActionToken() などで行動消費することを期待する
                this._commandContext._submit();
            }
            else {
                // 何も行動しなかった
                this.consumeActionToken(unit.unit);
            }
        }
        else {
            // このフェーズで行動決定するべき Entity ではなかった。そのままフェーズを進める。
            this.nextActionUnit();
        }

    }
    
    private update_RunEnding(): void {
        console.log("update_RunEnding");
        this._currentRun++;
        if (this._currentRun >= this._runs.length) {
            this._phase = SchedulerPhase.TurnEnding;
        }
        else {
            this._phase = SchedulerPhase.RunStarting;
        }
    }
    
    private update_TurnEnding(): void {
        console.log("update_TurnEnding flushSequelSet");

        // ターン終了時に Sequel が残っていればすべて掃き出す
        this.flushSequelSet();

        this._phase = SchedulerPhase.TurnStarting;
    }

    private buildOrderTable(): void {
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
                        unit: entity,
                        attr: attr, 
                        actionCount: actionCount
                    });

                    // このターン内の最大行動回数 (phase 数) を調べる
                    runCount = Math.max(runCount, actionCount);
                }
            });
        }

        // 勢力順にソート
        this._units = this._units.sort((a, b) => { return REData.factions[a.attr.factionId()].schedulingOrder - REData.factions[b.attr.factionId()].schedulingOrder; });

        this._runs = new Array(runCount);
        for (let i = 0; i < this._runs.length; i++) {
            this._runs[i] = { actions: []};
        }

        // Faction にかかわらず、マニュアル操作 Unit は最優先で追加する
        this._units.forEach(unit => {
            if (unit.attr.manualMovement()) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].actions.push({
                        unit: unit,
                        actionCount: 1,
                    });
                }
            }
        });

        // 次は倍速以上の NPC. これは前から詰めていく。
        this._units.forEach(unit => {
            if (!unit.attr.manualMovement() && unit.actionCount >= 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].actions.push({
                        unit: unit,
                        actionCount: 1,
                    });
                }
            }
        });

        // 最後に等速以下の NPC を後ろから詰めていく
        this._units.forEach(unit => {
            if (!unit.attr.manualMovement() && unit.actionCount < 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[this._runs.length - 1 - i].actions.push({  	// 後ろから詰めていく
                        unit: unit,
                        actionCount: 1,
                    });
                }
            }
        });

        //console.log("unis:", this._units);
        //console.log("runs:", this._runs);

        // TODO: Merge

    }

    _openDialogModel(causeEntity: REGame_Entity, value: REDialog) {
        this._dialogContext.setCauseEntity(causeEntity);
        this._dialogContext._setDialogModel(value);
        REGame.integration.onDialogOpend(this._dialogContext);
        //const visual = 
        //this._dialogContext._visual = visual;
    }

    _closeDialogModel() {
        this._dialogContext._setDialogModel(null);
        //if (this._dialogContext._visual) {
        //    this._dialogContext._visual.onClose();
        //    this._dialogContext._visual = undefined;
        //}
        REGame.integration.onDialogClosed(this._dialogContext);
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
            REGame.integration.onFlushSequelSet(this._sequelSet);

            this._sequelSet = new RESequelSet();
        }
    }

}
