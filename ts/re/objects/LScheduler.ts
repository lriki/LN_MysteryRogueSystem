import { assert, RESerializable } from "ts/re/Common";
import { MRBasics } from "ts/re/data/MRBasics";
import { DFactionId, MRData } from "ts/re/data/MRData";
import { DStateRestriction } from "../data/DState";
import { SSchedulerPhase } from "../system/scheduling/SSchedulerPhase";
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



export enum LSchedulerPhase
{
    RoundStarting,

    Processing,

    RoundEnding,
}

@RESerializable
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
                //const canAct = entity.iterateStates(s => s.stateEffect().restriction != DStateRestriction.NotAction);
                //if (canAct) {

                    const unit = this.newUnit(entity, behavior);
    
                    //const speedLevel = this.getSpeedLevel(entity);
                    const actionCount = unit.calcActionCount();
                    //unit.actionCount = speedLevel;
                    unit.speedLevel = unit.speedLevel2 = LScheduler2.getSpeedLevel(entity);
                     
                    // if (unit.actionCount < 0) {
                    //     unit.actionCount = 1;
                    // }
    
                    this._maxActionCount = Math.max(this._maxActionCount, actionCount);
                //}
            }
        }
        
        this.maxRunCount = this._maxActionCount;

        // 勢力順にソートしておく。
        // これによって Player を優先的に検索できるようになる。
        const sortedUnits = this._schedulingUnits.immutableSort((a, b) => { return MRData.factions[a.factionId()].schedulingOrder - MRData.factions[b.factionId()].schedulingOrder; });
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

        const agi = entity.actualParam(MRBasics.params.agi);
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
            for (const unit2 of this._schedulingUnits) {
                if (unit2.isValid() && unit2.isManual() && !unit2.isActionCompleted()) {
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

                    
                    if (unit == this.currentUnit()) {
                        // 素早さ草を飲んだ場合など、自分自身で速度アップした場合、Run をまたがずに直後に再行動したい。
                        // この時行動速度が x1 の Unit しかいないのに Run を増やすと、モーションのタイミングがずれることがある。
                        // 例えば、x1 Enemy が次の Run で行動することになるため、Player が移動後アイテムを拾ったときのモーションとの間に
                        // Run1 の AIMajorPhase が入り、ここで Flush されるため、Player と Enemy のモーションがまとめて再生されなくなる。
                    }
                    else {
                        this.maxRunCount = Math.max(this.maxRunCount, unit.speedLevel);
                    }
                    
                    // 速度の増減分だけ、行動トークンも調整する。
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
