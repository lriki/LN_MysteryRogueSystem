import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DFactionId, REData } from "ts/data/REData";
import { LUnitBehavior } from "./behaviors/LUnitBehavior";
import { LEntity } from "./LEntity";
import { LEntityId } from "./LObject";
import { REGame } from "./REGame";

export interface UnitInfo
{
    entityId: LEntityId;	        // 一連の実行中に Collapse などで map から消えたりしたら empty になる
    //attr: LUnitAttribute;     // cache for avoiding repeated find.
    behavior: LUnitBehavior;
    actionCount: number;    // 行動順リストを作るための一時変数。等速の場合は1,倍速の場合は2.x
    factionId: DFactionId;  // これも頻繁に参照するためキャッシュ
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

export class LScheduler {
    private _actorEntities: LEntityId[] = [];   // Part 中に行動する全 Entity
    private _units: UnitInfo[] = [];
    private _runs: RunInfo[] = [];
    private _currentRun: number = 0;
    public _currentStep: number = 0;
    private _currentPhaseIndex: number = 0;
    //private _waitCount: number = 0;

    //_currentTurnEntityId: LEntityId = LEntityId.makeEmpty();

    public clear() {
        this._actorEntities = [];
        this._units = [];
        this._runs = [];
        this._currentRun = 0;
        this._currentStep = 0;
        //this._currentTurnEntityId = LEntityId.makeEmpty();
    }

    public currentPhaseIndex(): number {
        return this._currentPhaseIndex;
    }

    public resetPhaseIndex(): void {
        this._currentPhaseIndex = 0;
    }

    public advancePhaseIndex(): void {
        this._currentPhaseIndex++;
    }

    public currentRunIndex(): number {
        return this._currentRun;
    }

    //public currentTurnEntity(): LEntity | undefined {
    //    return this._currentTurnEntityId.hasAny() ? REGame.world.entity(this._currentTurnEntityId) : undefined;
    //}

    public resetRunIndex(): void {
        this._currentRun = 0;
    }

    public advanceRunIndex(): boolean {
        this._currentRun++;
        return (this._currentRun < this._runs.length);
    }
    
    //public setWaitCount(value: number): void {
    //    this._waitCount = value;
    //}

    /*
    public updateWaiting(): boolean {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        else {
            return false;
        }
    }
*/

    public currentRun(): RunInfo {
        return this._runs[this._currentRun];
    }

    //public clearCurrentTurnEntity(): void {
    //    this._currentTurnEntityId = LEntityId.makeEmpty();
    //}

    //public setCurrentTurnEntity(entity: LEntity): void {
    //    assert(this._currentTurnEntityId.isEmpty());
    //    this._currentTurnEntityId = entity.entityId().clone();
    //}



    public actionScheduleTable(): RunInfo[] {
        return this._runs;
    }

    public runs(): RunInfo[] {
        return this._runs;
    }

    public units(): UnitInfo[] {
        return this._units;
    }

    public actorEntities(): LEntity[] {
        return this._actorEntities.map(id => REGame.world.entity(id));
    }

    public getSpeedLevel(entity: LEntity): number {
        // TODO: ユニットテスト用。後で消す
        const b = entity.findBehavior(LUnitBehavior);
        if (b && b._speedLevel != 0) return b._speedLevel;

        const agi = entity.actualParam(DBasics.params.agi);
        return Math.ceil(agi / 100.0);
    }
    
    public buildOrderTable(): void {
        this._actorEntities = [];
        this._units = [];

        let runCount = 0;

        // 行動できるすべての entity を集める
        {
            REGame.map.entities().forEach(entity => {
                const behavior = entity.findBehavior(LUnitBehavior);
                if (behavior) {
                    const factionId = entity.getOutwardFactionId();
                    assert(factionId > 0);

                    const speedLevel = this.getSpeedLevel(entity);
                    assert(speedLevel != 0);

                    let actionCount = speedLevel;
                    
                    // 鈍足状態の対応
                    if (actionCount < 0) {
                        actionCount = 1;
                    }

                    this._units.push({
                        entityId: entity.entityId(),
                        behavior: behavior,
                        actionCount: actionCount,
                        factionId: factionId,
                    });

                    // このターン内の最大行動回数 (phase 数) を調べる
                    runCount = Math.max(runCount, actionCount);

                    this._actorEntities.push(entity.entityId());
                }
            });
        }

        // 勢力順にソート
        this._units = this._units.sort((a, b) => { return REData.factions[a.factionId].schedulingOrder - REData.factions[b.factionId].schedulingOrder; });

        this._runs = new Array(runCount);
        for (let i = 0; i < this._runs.length; i++) {
            this._runs[i] = { steps: []};
        }

        // Faction にかかわらず、マニュアル操作 Unit は最優先で追加する
        this._units.forEach(unit => {
            if (unit.behavior.manualMovement()) {
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
            if (!unit.behavior.manualMovement() && unit.actionCount >= 2) {
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
            if (!unit.behavior.manualMovement() && unit.actionCount < 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[this._runs.length - 1 - i].steps.push({  	// 後ろから詰めていく
                        unit: unit,
                        iterationCount: 1,
                    });
                }
            }
        });


        // Merge
        {
            const flatSteps = this._runs.flatMap(x => x.steps);
    
            for (let i1 = flatSteps.length - 1; i1 >= 0; i1--) {
                const step1 = flatSteps[i1];
    
                // step1 の前方を検索
                for (let i2 = i1 - 1; i2 >= 0; i2--) {
                    const step2 = flatSteps[i2];
    
                    if (step2.unit.factionId != step1.unit.factionId) {
                        // 別勢力の行動予定が見つかったら終了
                        break;
                    }
    
                    if (step2.unit.entityId.equals(step1.unit.entityId)) {
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

    public invalidateEntity(entity: LEntity) {
        const index = this._units.findIndex(x => x.entityId.equals(entity.entityId()));
        if (index >= 0) {
            this._units[index].entityId = LEntityId.makeEmpty();
            
            this._actorEntities = this._actorEntities.filter(x => !x.equals(entity.entityId()));
        }
    }
}

