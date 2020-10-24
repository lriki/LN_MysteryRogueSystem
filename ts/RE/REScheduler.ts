import { assert, Log } from "../Common";
import { RECommandContext } from "./RECommandContext";
import { REData } from "./REData";
import { REGame } from "./REGame";
import { REGameManager } from "./REGameManager";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REGame_Entity } from "./REGame_Entity";


interface UnitInfo
{
    unit: REGame_Entity | undefined;	        // 一連の実行中に Collapse などで map から消えたりしたら null になる
    attr: REGame_UnitAttribute;     // cache for avoiding repeated find.
    actionCount: number;    // 行動順リストを作るための一時変数。等速の場合は1,倍速の場合は2.x
}

interface ActionInfo
{
    unit: UnitInfo;         // 行動させたい unit
    actionCount: number;    // 何回連続行動するか。Run のマージなどで 0 になることもある。
};

interface RunInfo
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
    private _commandContext: RECommandContext = new RECommandContext();
    private _phase: SchedulerPhase = SchedulerPhase.TurnStarting;
    private _units: UnitInfo[] = [];
    private _runs: RunInfo[] = [];
    private _currentRun: number = 0;
    private _currentUnit: number = 0;

    constructor() {
    }

    stepSimulation(): void {

        while (true) {
            // Sequel 終了待ち
            if (this._commandContext.visualAnimationWaiting()) {
                if (REGameManager.visualRunning()) {
                    // Sequel 実行中
                    break;
                }
                else {
                    // Sequel 終了
                    this._commandContext.clearVisualAnimationWaiting();
                }
            }

            // 現在のコマンドリストの実行は終了しているが、Visual 側がアニメーション中であれば完了を待ってから次の Unit の行動を始めたい
            if (!this._commandContext.isRunning() && REGameManager.visualRunning()) {
                break;
            }

            if (this._commandContext.isRunning()) {
                //this._commandContext.processCommand();
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
        Log.d("s update_TurnStarting");

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
    
    private update_ManualAction(): void {
        Log.d("update_ManualAction started.");

        const run = this._runs[this._currentRun];
        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        if (unit.unit) {
            if (unit.attr.manualMovement()) {
                
                // TODO:
                assert(0);
            }
        }

        // 全 Unit 分処理を終えたら次の Phase へ
        this._currentUnit++;
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.AIMinorAction;
            Log.d("update_ManualAction finish.");
        }
        else {
            Log.d("update_ManualAction continued.");
        }
    }
    
    private update_AIMinorAction(): void {
        const run = this._runs[this._currentRun];
        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        if (unit.unit) {
            if (!unit.attr.manualMovement()) {
                // TODO:
                assert(0);
            }
        }

        // 全 Unit 分処理を終えたら次の Phase へ
        this._currentUnit++;
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.AIMajorAction;
        }
    }
    
    private update_AIMajorAction(): void {
        const run = this._runs[this._currentRun];
        const action = run.actions[this._currentUnit];
        const unit = action.unit;

        if (unit.unit) {
            if (!unit.attr.manualMovement()) {
                // TODO:
                assert(0);
            }
        }

        // 全 Unit 分処理を終えたら次の Phase へ
        this._currentUnit++;
        if (this._currentUnit >= run.actions.length) {
            this._currentUnit = 0;
            this._phase = SchedulerPhase.RunEnding;
        }
    }
    
    private update_RunEnding(): void {
        this._currentRun++;
        if (this._currentRun >= this._runs.length) {
            this._phase = SchedulerPhase.TurnEnding;
        }
        else {
            this._phase = SchedulerPhase.RunStarting;
        }
    }
    
    private update_TurnEnding(): void {

        // ターン終了時に、Animation が残っていればすべて掃き出す
        //executeAnimationQueue(true);

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
                    let actionCount = attr.speedLevel() + 1;
                    
                    // 鈍足状態の対応
                    if (actionCount <= 0) {
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
}
