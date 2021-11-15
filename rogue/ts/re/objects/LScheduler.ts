import { assert, RESerializable } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DFactionId, REData } from "ts/re/data/REData";
import { SSchedulerPhase } from "../system/SSchedulerPhase";
import { LUnitBehavior } from "./behaviors/LUnitBehavior";
import { LEntity } from "./LEntity";
import { LBehaviorId, LEntityId } from "./LObject";
import { REGame } from "./REGame";

export type LTOUnitId = number;
export class LTOUnit {
    private _id: LTOUnitId;
    private _entityId: LEntityId;	        // 一連の実行中に Collapse などで map から消えたりしたら empty になる
    //attr: LUnitAttribute;     // cache for avoiding repeated find.
    private _behaviorId: LBehaviorId;
    private _factionId: DFactionId;  // これも頻繁に参照するためキャッシュ

    actionCount: number;    // 行動順リストを作るための一時変数。等速の場合は1,倍速の場合は2.x
    speedLevel: number;     // 最新の Table を作った時の SpeedLevel. Entity のものと変化がある場合は Table を変更する必要がある。
    speedLevel2: number;    // Refresh 時の一時変数

    public constructor(id: LTOUnitId, entity: LEntity, behavior: LUnitBehavior, actionCount: number) {
        this._id = id;
        this._entityId = entity.entityId();
        this._behaviorId = behavior.id();
        this.actionCount = actionCount;
        this.speedLevel = 0;
        this.speedLevel2 = 0;

        this._factionId = entity.getOutwardFactionId();
        assert(this._factionId > 0);
    }

    public id(): number {
        return this._id;
    }

    public entityId(): LEntityId {
        return this._entityId;
    }

    public entity(): LEntity {
        return REGame.world.entity(this._entityId);
    }

    public factionId(): number {
        return this._factionId;
    }

    public behavior(): LUnitBehavior {
        return REGame.world.behavior(this._behaviorId) as LUnitBehavior;
    }

    public isValid(): boolean {
        return this._entityId.hasAny();
    }

    public invalidate(): void {
        this._entityId = LEntityId.makeEmpty();
    }

    public resetEntity(entity: LEntity): void {
        this._entityId = entity.entityId();
        this._behaviorId = entity.getEntityBehavior(LUnitBehavior).id();
    }
}

export class LTOStep {

    private _unitId: LTOUnitId;         // 行動させたい unit
    private _iterationCountMax: number;    // 何回連続行動できるか。Run のマージなどで 0 になることもある。
    iterationCount2: number;

    // startingActionTokenCount: number;   // Run 開始時の Entity の ActionTokenCount.
    // actedCount: number;         // 行動したか

    public constructor(unit: LTOUnit) {
        this._unitId = unit.id();
        this._iterationCountMax = 1;
        this.iterationCount2 = 0;
        // this.startingActionTokenCount = 0;
        // this.actedCount = 0;
    }

    public unitId(): number {
        return this._unitId;
    }

    public unit(): LTOUnit {
        assert(this._unitId >= 0);
        return REGame.scheduler_old.units2()[this._unitId];
    }

    public iterationCountMax(): number {
        return this._iterationCountMax;
    }

    public setIterationCountMax(value: number): void {
        this._iterationCountMax = value;
    }

    public remainIterationCount(): number {
        return (this._iterationCountMax - this.iterationCount2).clamp(0, this._iterationCountMax);
    }

    public isIterationClosed(): boolean {
        return this.iterationCount2 >= this._iterationCountMax;
    }

    public increaseIterationCount(): void {
        this.iterationCount2++;
    }

    public isValid(): boolean {
        return this._unitId >= 0 && this.unit().isValid();
    }

    public invalidate(): void {
        this._unitId = -1;
        this._iterationCountMax = 0;
    }
}



export interface RunInfo
{
    steps: LTOStep[];
};


@RESerializable
export class LScheduler {
    private _actorEntities: LEntityId[] = [];   // Round 中に行動する全 Entity
    private _units2: LTOUnit[] = [];    
    private _runs: RunInfo[] = [];
    private _currentRun: number = 0;
    public _currentStep: number = 0;
    public _currentPhaseIndex: number = 0;
    //private _waitCount: number = 0;

    //_currentTurnEntityId: LEntityId = LEntityId.makeEmpty();

    public clear() {
        this._actorEntities = [];
        this._units2 = [];
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



    public actionScheduleTable(): readonly RunInfo[] {
        return this._runs;
    }

    public runs(): readonly RunInfo[] {
        return this._runs;
    }

    public units2(): readonly LTOUnit[] {
        return this._units2;
    }

    public actorEntities(): readonly LEntity[] {
        return this._actorEntities.map(id => REGame.world.entity(id));
    }

    public getSpeedLevel(entity: LEntity): number {
        // TODO: ユニットテスト用。後で消す
        const b = entity.findEntityBehavior(LUnitBehavior);
        if (b && b._speedLevel != 0) return b._speedLevel;

        const agi = entity.actualParam(REBasics.params.agi);
        const v = (agi >= 0) ? (Math.floor(agi / 100) + 1) : Math.floor(agi / 100);
        return v;
    }
    
    private newUnit(entity: LEntity, behavior: LUnitBehavior): LTOUnit {
        const speedLevel = this.getSpeedLevel(entity);
        assert(speedLevel != 0);

        let actionCount = speedLevel;
        
        // 鈍足状態の対応
        if (actionCount < 0) {
            actionCount = 1;
        }

        const unit = new LTOUnit(this._units2.length, entity, behavior, actionCount);
        unit.speedLevel = speedLevel;
        unit.speedLevel2 = speedLevel;

        this._units2.push(unit);
        return unit;
    }

    public buildOrderTable(): void {
        this._actorEntities = [];
        this._units2 = [];

        let runCount = 0;

        // 行動できるすべての entity を集める
        {
            REGame.map.entities().forEach(entity => {
                const behavior = entity.findEntityBehavior(LUnitBehavior);
                if (behavior) {
                    const unit = this.newUnit(entity, behavior);

                    // このターン内の最大行動回数 (phase 数) を調べる
                    runCount = Math.max(runCount, unit.actionCount);

                    this._actorEntities.push(entity.entityId());
                }
            });
        }

        // 勢力順にソート
        const sortedUnits = this._units2.immutableSort((a, b) => { return REData.factions[a.factionId()].schedulingOrder - REData.factions[b.factionId()].schedulingOrder; });
        //const sortedUnits = this._units2;

        this._runs = new Array(runCount);
        for (let i = 0; i < this._runs.length; i++) {
            this._runs[i] = { steps: []};
        }

        // Faction にかかわらず、マニュアル操作 Unit は最優先で追加する
        sortedUnits.forEach(unit => {
            if (unit.behavior().manualMovement()) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].steps.push(new LTOStep(unit));
                }
            }
        });

        // 次は倍速以上の NPC. これは前から詰めていく。
        sortedUnits.forEach(unit => {
            if (!unit.behavior().manualMovement() && unit.actionCount >= 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[i].steps.push(new LTOStep(unit));
                }
            }
        });

        // 最後に等速以下の NPC を後ろから詰めていく
        sortedUnits.forEach(unit => {
            if (!unit.behavior().manualMovement() && unit.actionCount < 2) {
                for (let i = 0; i < unit.actionCount; i++) {
                    this._runs[this._runs.length - 1 - i].steps.push(new LTOStep(unit));  // 後ろから詰めていく
                }
            }
        });


        // Merge
        {
            /*
            for (let iRun = this._runs.length - 1; iRun >= 1; iRun--) {
                const steps = this._runs[iRun].steps;
                for (let iStep = steps.length - 1; iStep >= 1; iStep--) {
                    const step1 = steps[iStep];

                    let iRun2 = iRun;
                    let iStep2 = iStep - 1;
                    for (; iRun2 >= 0; iRun2--) {
                        for (; iStep2 >= 0; iStep2--) {
                            const step2 = this._runs[iRun2].steps[iStep2];
                            
                            if (step2.unit.factionId != step1.unit.factionId) {
                                // 別勢力の行動予定が見つかったら終了
                                iRun2 = -1;
                                break;
                            }
            
                            if (step2.unit.entityId.equals(step1.unit.entityId)) {
                                const newStep: RunStepInfo = {
                                    unit: step1.unit,
                                    iterationCount: 1,
                                };
                                this._runs[iRun2].steps.splice(iStep2, 0, newStep);

                                // 勢力をまたがずに同一 entity の行動予定が見つかったら、
                                // そちらへ iterationCount をマージする。
                                //step2.iterationCount += step1.iterationCount;
                                step1.iterationCount = 0;
                                iRun2 = -1;
                                break;
                            }
                        }
                    }
    
                }

            }
*/


            const flatSteps = this._runs.flatMap(x => x.steps);
    
            for (let i1 = flatSteps.length - 1; i1 >= 0; i1--) {
                const step1 = flatSteps[i1];
    
                // step1 の前方を検索
                for (let i2 = i1 - 1; i2 >= 0; i2--) {
                    const step2 = flatSteps[i2];
    
                    if (step2.unit().factionId() != step1.unit().factionId()) {
                        // 別勢力の行動予定が見つかったら終了
                        break;
                    }
    
                    if (step2.unit().entityId().equals(step1.unit().entityId())) {
                        // 勢力をまたがずに同一 entity の行動予定が見つかったら、
                        // そちらへ iterationCount をマージする。
                        step2.setIterationCountMax(step2.iterationCountMax() + step1.iterationCountMax());
                        step1.setIterationCountMax(0);
                        break;
                    }
                }
            }

        }
    }

    public attemptRefreshTurnOrderTable(): void {
        // 各 Entity の最新の SpeedLevel を取得しながら、Refresh が必要かチェックする
        const changesUnits: LTOUnit[] = [];
        let maxSpeed = 0;
        for (const unit of this._units2) {
            if (unit.isValid()) {
                const entity = unit.entity();
                unit.speedLevel2 = this.getSpeedLevel(entity);
                const diff = unit.speedLevel2 - unit.speedLevel;
                if (unit.speedLevel2 > unit.speedLevel) {
                    // 速度アップ
                    changesUnits.push(unit);
                    maxSpeed = Math.max(unit.speedLevel2, maxSpeed);
                    unit.speedLevel = unit.speedLevel2;
                    
                    // 速度の増減分だけ、行動トークンも調整する。
                    // 例えば速度が増えた時は次の Run で追加の行動が発生するので、動けるようになる。
                    entity._actionToken.charge(diff);
                }
                if (unit.speedLevel2 < unit.speedLevel) {
                    // 速度ダウン
                    entity._actionToken.charge(diff);
                    unit.speedLevel = unit.speedLevel2;
                }
            }
        }

        // Table 調整が必要？
        if (changesUnits.length > 0) {
            const curRun = this._runs[this._currentRun];

            //console.log("TO Refresh!!", this);
            //this.count++;
            //if (this.count >= 2) {
            //    throw new Error();
            //}

            // 次の Run を取り出す。
            // 無ければ終端に新たな Run を作る。
            let nextRun: RunInfo;
            if (this._currentRun >= this._runs.length - 1) {
                nextRun = {
                    steps: [],
                };
                this._runs.push(nextRun);
            }
            else {
                nextRun = this._runs[this._currentRun + 1];
            }

            // 次の Run に、増速した Unit の Step を増やす。
            // もし既に Step がある場合は、iteration を増やす。
            for (const unit of changesUnits) {
                const step = nextRun.steps.find(s =>  unit.entityId().equals(s.unit().entityId()));
                if (step) {
                    step.setIterationCountMax(step.iterationCountMax() + 1);
                }
                else {
                    // Step 新規作成
                    nextRun.steps.unshift(new LTOStep(unit));
                }
            }

            //for (let iStep2 = this._currentStep + 1; iStep2 < curRun.steps.length; iStep2++) {
             //   const step2 = curRun.steps[iStep2];
            for (const step2 of curRun.steps) {
                if (step2.isIterationClosed()) continue;
                if (!!changesUnits.find(x => x.id() == step2.unitId())) continue;   // 今回増速した人は対象外

                let newStep = nextRun.steps.find(s =>  step2.unit().entityId().equals(s.unit().entityId()));
                if (!newStep) {
                    newStep = new LTOStep(step2.unit());
                    nextRun.steps.unshift(newStep);
                }

                if (step2.remainIterationCount() == 1) {
                    newStep.setIterationCountMax(1);
                    step2.invalidate();
                }
                else if (step2.remainIterationCount() >= 2) {
                    const rem = step2.remainIterationCount() - 1;
                    step2.setIterationCountMax(1);
                    newStep.setIterationCountMax(rem);
                }
            }

            /*
            // 現在 Run に残っている行動を次の Run に移す。
            for (const step2 of curRun.steps) {
                // ※行動済みかどうかは actedCount と iterationCountMax の比較で行う。
                //   単に iteration 完了かだけでは、本当に取るべき行動をすべて取ったかは判断できない。
                if (step2.actedCount < step2.iterationCountMax()) {// && step2.unit().speedLevel < maxSpeed) {
                    const step = newRun.steps.find(s =>  step2.unit().entityId().equals(s.unit().entityId()));
                    if (step) {
                        //if (step2.unit().speedLevel < maxSpeed) {
                            // 残っている IterationCount をマージする
                            step.setIterationCountMax(step2.remainIterationCount());
                        //}
                        //else {
                            
                        //}
                    }
                    else {
                        // Step 新規作成
                        newRun.steps.unshift(new LTOStep(step2.unit()));
                    step2.invalidate();
                    }

                }
            }
            */
            
        }
    }
    //count = 0;

    public invalidateEntity(entity: LEntity) {
        const index = this._units2.findIndex(x => x.entityId().equals(entity.entityId()));
        if (index >= 0) {
            this._units2[index].invalidate();
            
            this._actorEntities = this._actorEntities.filter(x => !x.equals(entity.entityId()));
        }
    }
    
    public resetEntity(entity: LEntity) {
        const index = this._units2.findIndex(x => x.entityId().equals(entity.entityId()));
        if (index >= 0) {
            this._units2[index].resetEntity(entity);
        }
    }
}




export enum LSchedulerPhase
{
    RoundStarting,

    Processing,

    RoundEnding,
}

export class LSchedulingUnit {
    private _index: number;
    private _entityId: LEntityId;
    private _unitBehaviorId: LBehaviorId;
    private _factionId: DFactionId;  // これも頻繁に参照するためキャッシュ
    private _iterationCountMax: number;    // 何回連続行動できるか
    private _iterationCount: number;
    //actionCount: number;    // 行動順リストを作った時の行動回数。等速の場合は1,倍速の場合は2.
    speedLevel: number;     // 最新の Table を作った時の SpeedLevel. Entity のものと変化がある場合は Table を変更する必要がある。
    speedLevel2: number;    // Refresh 時の一時変数

    public constructor(index: number, entity: LEntity, unitBehavior: LUnitBehavior) {
        this._index = index;
        this._entityId = entity.entityId();
        this._unitBehaviorId = unitBehavior.id();
        this._factionId = entity.getOutwardFactionId();
        assert(this._factionId > 0);
        this._iterationCountMax = 0;
        this._iterationCount = 0;
        //this.actionCount = 0;
        this.speedLevel = 0;
        this.speedLevel2 = 0;
    }

    public index(): number {
        return this._index;
    }

    public entityId(): LEntityId {
        return this._entityId;
    }

    public get entity2(): LEntity {
        return this.entity();
    }

    public entity(): LEntity {
        return REGame.world.entity(this._entityId);
    }

    public factionId(): number {
        return this._factionId;
    }

    public unitBehavior(): LUnitBehavior {
        return REGame.world.behavior(this._unitBehaviorId) as LUnitBehavior;
    }

    public calcActionCount(): number {
        const speedLevel = LScheduler2.getSpeedLevel(this.entity());
        if (speedLevel <= 0) {
            // 鈍足状態。行動回数としては 1 として扱う。
            // 実際に手番が回ることになるが、行動トークンを持っていないので行動できないことになる。
            return 1;
        }
        else {
            return speedLevel;
        }
    }

    public isManual(): boolean {
        return this.unitBehavior().manualMovement();
    }
    
    public isActionCompleted(): boolean {
        const actionToken = this.entity()._actionToken;
        return !actionToken.canMinorAction() && !actionToken.canMajorAction();
    }

    public isValid(): boolean {
        return this._entityId.hasAny();
    }

    public invalidate(): void {
        this._entityId = LEntityId.makeEmpty();
    }

    public resetEntity(entity: LEntity): void {
        this._entityId = entity.entityId();
        this._unitBehaviorId = entity.getEntityBehavior(LUnitBehavior).id();
        this._factionId = entity.getOutwardFactionId();
        assert(this._factionId > 0);
    }

    public resetIterationCount(): void {
        this._iterationCount = 0;
    }
    
    public iterationCountMax(): number {
        return this._iterationCountMax;
    }

    public setIterationCountMax(value: number): void {
        this._iterationCountMax = value;
    }

    public remainIterationCount(): number {
        return (this._iterationCountMax - this._iterationCount).clamp(0, this._iterationCountMax);
    }

    public isIterationClosed(): boolean {
        return this._iterationCount >= this._iterationCountMax;
    }

    public increaseIterationCount(): void {
        this._iterationCount++;
    }
}

// - Round 中に新たに発生した Unit は、今回 round では行動しない
@RESerializable
export class LScheduler2 {
    /*
    [2021/11/3] 行動順テーブル廃止
    ----------
    行動速度の変化によってテーブルの再編成が必要になるが、その処理がかなり複雑になってきたため。
    行動候補となるタイミングで都度 IterationCount などを判断する仕組みの方が、処理負荷は上がるが多少シンプルで柔軟に対応できる。
    */
    public chedulerPhase: LSchedulerPhase = LSchedulerPhase.RoundStarting;

    // ターン実行中の Entity 発生・削除に備え、Map の Entities を直接参照せず、
    // Round 開始時に取り出しておく。そのためこの配列内の Entity が destroy されたときは
    // 要素に対して invalidaate しておく必要がある。
    public _schedulingUnits: LSchedulingUnit[] = [];

    nextSearchIndex = 0;
    _currentPhaseIndex = 0;

    maxRunCount = 0;
    currentRunIndex = 0;

    // buildSchedulingUnits() 時点の最大行動回数。
    // あくまで参考値。Step 実行中の行動回数減少などは反映しない。
    private _maxActionCount = 0;

    public buildSchedulingUnits(): void {
        this._schedulingUnits = [];
        this._maxActionCount = 0;
        this.currentRunIndex = 0;

        // 行動できるすべての entity を集める
        for (const entity of REGame.map.entities()) {
            const behavior = entity.findEntityBehavior(LUnitBehavior);
            if (behavior) {
                const unit = this.newUnit(entity, behavior);

                //const speedLevel = this.getSpeedLevel(entity);
                const actionCount = unit.calcActionCount();
                //unit.actionCount = speedLevel;
                unit.speedLevel = unit.speedLevel2 = LScheduler2.getSpeedLevel(entity);
                 
                // if (unit.actionCount < 0) {
                //     unit.actionCount = 1;
                // }

                this._maxActionCount = Math.max(this._maxActionCount, actionCount);
            }
        }
        
        this.maxRunCount = this._maxActionCount;

        // 勢力順にソートしておく。
        // これによって Player を優先的に検索できるようになる。
        const sortedUnits = this._schedulingUnits.immutableSort((a, b) => { return REData.factions[a.factionId()].schedulingOrder - REData.factions[b.factionId()].schedulingOrder; });
    }

    public schedulingUnits(): readonly LSchedulingUnit[] {
        return this._schedulingUnits;
    }

    public currentPhaseIndex(): number {
        return this._currentPhaseIndex;
    }

    private newUnit(entity: LEntity, behavior: LUnitBehavior): LSchedulingUnit {
        const unit = new LSchedulingUnit(this._schedulingUnits.length, entity, behavior);
        this._schedulingUnits.push(unit);
        return unit;
    }

    public static getSpeedLevel(entity: LEntity): number {
        // TODO: ユニットテスト用。後で消す
        const b = entity.findEntityBehavior(LUnitBehavior);
        if (b && b._speedLevel != 0) return b._speedLevel;

        const agi = entity.actualParam(REBasics.params.agi);
        const v = (agi >= 0) ? (Math.floor(agi / 100) + 1) : Math.floor(agi / 100);
        return v;
    }

    // schedulingUnits に行動トークンを配る。
    // 鈍足状態の Unit に対してはウェイトカウントの更新も行う。
    public dealActionTokens(): void {

        // ターン開始時の各 unit の設定更新
        for (const unit of this._schedulingUnits) {
            const behavior = unit.unitBehavior();
            const entity = unit.entity();

            const speedLevel = LScheduler2.getSpeedLevel(entity);

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
        }
    }

    public resetSeek(): void {
        this.nextSearchIndex = 0;
    }

    public nextUnit(phase: SSchedulerPhase): boolean {
        if (!this.isSeeking()) {
            return false;   // iteration end.
        }

        while (true) {
            const unit = this._schedulingUnits[this.nextSearchIndex];
            this.nextSearchIndex++;
            if (this.pick(phase, unit)) {
                unit.resetIterationCount();
                return true;
            }
            
            if (this.nextSearchIndex >= this._schedulingUnits.length) {
                return false;   // iteration end.
            }
        }
    }
    
    public currentUnit(): LSchedulingUnit {
        const index = this.nextSearchIndex - 1;
        assert(0 <= index && index < this._schedulingUnits.length);
        return this._schedulingUnits[index];
    }

    public isSeeking(): boolean {
        return this.nextSearchIndex < this._schedulingUnits.length;
    }

    // https://1drv.ms/x/s!Ano7WuQbt_eBgcZLyMaObhXjKW0uig?e=nkrHye
    private pick(phase: SSchedulerPhase, unit: LSchedulingUnit): boolean {
        if (!unit.isValid()) return false;
        if (!phase.testProcessable(unit.entity(), unit.unitBehavior())) return false;



        // Player に関しては、IterationCount は常に1である。マージは行わない。
        // 3 倍速 Player が 2 人いる場合は常に交互に操作することになる。
        if (unit.isManual()) {
            unit.setIterationCountMax(1);
            return true;
        }

        const actionCount = unit.calcActionCount();

        // 行動回数 1 の NPC の場合、他に行動回数が 2 以上 (倍速 Entity) が要る場合は行動しない。
        // つまり、行動優先度をさげ、速度が速い人に先をゆずる。
        if (actionCount == 1) {
            if (this.currentRunIndex >= this.maxRunCount - 1) {
                unit.setIterationCountMax(actionCount);
                return true;
            }
            else {
                return false;
            }
            /*
            let otherActionMax = 0;
            for (let i = 0; i < this._schedulingUnits.length; i++) {
                const unit2 = this._schedulingUnits[i];
                if (unit2.index() != unit.index() && !unit2.isActionCompleted()) {
                    otherActionMax = Math.max(otherActionMax, unit2.actionCount);
                }
            }
            if (otherActionMax >= 2) {
                return false;
            }
            else {
                // このっているのは行動回数 1 のものだけなので、動いてよい
                unit.setIterationCountMax(1);
                return true;
            }
            */
        }

        // 倍速以上の NPCは、他に Manual で操作する Entity がいる場合交互に動くので、IterationCount は 1.
        // NPC しか残っていないときは、残行動数分まとめて動ける。
        if (actionCount >= 2) {
            let manualActionMax = 0;
            for (const unit of this._schedulingUnits) {
                if (unit.isManual() && !unit.isActionCompleted()) {
                    manualActionMax = Math.max(manualActionMax, actionCount);
                }
            }
            if (phase.isAllowIterationAtPrepare()) {
                if (manualActionMax > 0) {
                    unit.setIterationCountMax(1);
                    return true;
                }
                else {
                    unit.setIterationCountMax(actionCount);
                    return true;
                }
            }
            else {
                unit.setIterationCountMax(1);
                return true;
            }
        }

        throw new Error("Unreachable.");
    }

    
    public invalidateEntity(entity: LEntity) {
        const index = this._schedulingUnits.findIndex(x => x.entityId().equals(entity.entityId()));
        if (index >= 0) {
            this._schedulingUnits[index].invalidate();
        }
    }
    
    public resetEntity(entity: LEntity) {
        const index = this._schedulingUnits.findIndex(x => x.entityId().equals(entity.entityId()));
        if (index >= 0) {
            this._schedulingUnits[index].resetEntity(entity);
        }
    }

    public hasReadyEntity(): boolean {
        for (const unit of this._schedulingUnits) {
            const actionToken = unit.entity()._actionToken;
            if (!unit.isActionCompleted()) {
                return true;
            }
        }
        return false;
    }
    
    public attemptRefreshSpeedLevel(): void {
        // 各 Entity の最新の SpeedLevel を取得しながら、Refresh が必要かチェックする
        const changesUnits: LSchedulingUnit[] = [];
        let maxSpeed = 0;
        for (const unit of this._schedulingUnits) {
            if (unit.isValid()) {
                const entity = unit.entity();
                unit.speedLevel2 = LScheduler2.getSpeedLevel(entity);
                const diff = unit.speedLevel2 - unit.speedLevel;
                if (unit.speedLevel2 > unit.speedLevel) {
                    // 速度アップ
                    changesUnits.push(unit);
                    maxSpeed = Math.max(unit.speedLevel2, maxSpeed);
                    unit.speedLevel = unit.speedLevel2;

                    this.maxRunCount = Math.max(this.maxRunCount, unit.speedLevel);
                    
                    // 速度の増減分だけ、行動トークンも調整する。
                    // 例えば速度が増えた時は次の Run で追加の行動が発生するので、動けるようになる。
                    entity._actionToken.charge(diff);

                    if (this.existsHighSpeedReadyEntity(unit)) {
                        // 他に倍速 Entity がいる場合は iterationCount を増やしたくない。
                        // 
                        // 例えば、素早さ草をのんだら直ちに Player にターンが回るが、
                        // 倍速Enemyがいるときに Player が素早さ草を飲んでも Player にターンを回したくない。
                    }
                    else {
                        unit.setIterationCountMax(unit.iterationCountMax() + diff);
                    }
                }
                if (unit.speedLevel2 < unit.speedLevel) {
                    // 速度ダウン
                    entity._actionToken.charge(diff);
                    unit.speedLevel = unit.speedLevel2;
                }
            }
        }
    }

    // subject 以外に、倍速かつまだ行動する可能性がある Unit が存在しているか？
    public existsHighSpeedReadyEntity(subject: LSchedulingUnit): boolean {
        for (const unit of this._schedulingUnits) {
            if (unit.isValid() && unit.index() != subject.index()) {
                if (unit.speedLevel > 1 && !unit.isActionCompleted()) {
                    return true;
                }
            }
        }
        return false;
    }
}
