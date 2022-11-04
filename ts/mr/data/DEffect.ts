import { assert } from "ts/mr/Common";
import { DSubEntityFindKey, DSpecialEffectId, DBlockLayerKind, DBlockLayerScope, DEntityCategoryId, DSubComponentEffectTargetKey, DRaceId, DElementId, DEffectId } from "./DCommon";
import { DEntityId } from "./DEntity";
import { DParameterId } from "ts/mr/data/DCommon";
import { MRData } from "./MRData";
import { DHelpers } from "./DHelper";
import { DFlavorEffect, IFlavorEffectProps } from "./DFlavorEffect";
import { DSpecialEffect, DSpecialEffectRef, ISpecialEffectProps } from "./DSpecialEffect";



export enum DParameterEffectApplyType {
    /** なし */
    None,

    /** ダメージ */
    Damage,

    /** 回復 */
    Recover,

    /** 吸収 */
    Drain,
}

export enum DValuePoint {
    Actual,
    Minimum,
    Growth,
}


export class DParameterQualifying {
    _parameterId: DParameterId;

    /** IDataSkill.damage.type  */
    applyType: DParameterEffectApplyType;

    applyTarget: DValuePoint;


    elementIds: DElementId[];  // (Index of DSystem.elements)

    formula: string;



    /** 分散度 (%) */
    variance: number;

    /** メッセージを出さないようにする。 */
    silent: boolean;

    conditionFormula?: string | undefined;
    fallback: boolean = false;

    alliesSideGainMessage?: string | undefined;
    alliesSideLossMessage?: string | undefined;
    opponentGainMessage?: string | undefined;
    opponentLossMessage?: string | undefined;
    




    public constructor(paramId: DParameterId, formula: string, applyType: DParameterEffectApplyType) {
        this._parameterId = paramId;
        this.applyType = applyType;
        this.applyTarget = DValuePoint.Actual;
        this.elementIds = [0];
        this.formula = formula;
        this.variance = 0;
        this.silent = false;
    }

    public withApplyTarget(value: DValuePoint): this {
        this.applyTarget = value;
        return this;
    }

    public withElementId(value: number): this {
        this.elementIds[0] = value;
        return this;
    }

    public withVariance(value: number): this {
        this.variance = value;
        return this;
    }

    public withSilent(value: boolean = true): this {
        this.silent = value;
        return this;
    }

    public withConditionFormula(value: string): this {
        this.conditionFormula = value;
        return this;
    }

    public withFallback(value: boolean = true): this {
        this.fallback = value;
        return this;
    }

    public clone(): DParameterQualifying {
        const i = new DParameterQualifying(0, "", DParameterEffectApplyType.None);
        i.copyFrom(this);
        return i;
    }

    public copyFrom(src: DParameterQualifying): void {
        this._parameterId = src._parameterId;
        this.applyType = src.applyType;
        this.applyTarget = src.applyTarget;
        this.elementIds = [...src.elementIds];
        this.formula = src.formula;
        this.variance = src.variance;
        this.silent = src.silent;
        this.conditionFormula = src.conditionFormula;
        this.alliesSideGainMessage = src.alliesSideGainMessage;
        this.alliesSideLossMessage = src.alliesSideLossMessage;
        this.opponentGainMessage = src.opponentGainMessage;
        this.opponentLossMessage = src.opponentLossMessage;
    }
}

//export interface DRmmzItemEffectQualifying {
//    effect: IDataEffect,
//}


export interface DOtherEffectQualifying {
    key: string,
}

export enum LStateLevelType {
    AbsoluteValue,
    RelativeValue,
}

/*
export interface DStateAdditionQualifying {
    stateId: string;
    level: number;
    levelType: LStateLevelType,
}
*/

export enum DRmmzEffectScope {
    /** なし */
    None = 0,

    /** 敵,単体 */
    Opponent_Single = 1,

    /** 敵,全体 */
    Opponent_All = 2,

    /** 敵,ランダム,1 */
    Opponent_Random_1 = 3,

    /** 敵,ランダム,2 */
    Opponent_Random_2 = 4,

    /** 敵,ランダム,3 */
    Opponent_Random_3 = 5,

    /** 敵,ランダム,4 */
    Opponent_Random_4 = 6,

    /** 味方,単体,生存 */
    Friend_Single_Alive = 7,

    /** 味方,全体,生存 */
    Friend_All_Alive = 8,

    /** 味方,単体,戦闘不能 */
    Friend_Single_Dead = 9,

    /** 味方,全体,戦闘不能 */
    Friend_All_Dead = 10,

    /** 使用者 */
    User = 11,

    /** 味方,単体,無条件 */
    Friend_Single_Unconditional = 12,

    /** 味方,全体,無条件 */
    Friend_All_Unconditional = 13,

    /** 敵と味方,全体 */
    Everyone = 14,
}

export enum DEffectHitType {
    Certain = 0,
    Physical = 1,
    Magical = 2,
}


export enum DEffectFieldScopeRange {
    Performer,  // 発動者自身
    Front1,
    StraightProjectile,
    ReceiveProjectile,  // 草受けの杖や矢の罠
    PointProjectile,        // 投石やスカイドラゴンの炎
    Selection,   // 対象となるアイテムを選択する。識別の巻物など、対象となる持ち物を選んで効果を発動するももの。
    Around, // 周囲
    AroundAndCenter,   // 周囲+中心。発動者自身も target に含まれ、効果が適用される。
    Center, // 中心。主に罠が、かかった entity に対して効果を発動するときに使う。
    Room,   // 発動者と同じ部屋
    Map,
}

export enum DEffectFieldScopeArea {
    Room,
    Floor,
}


export enum DEffectScopeTargetFactionFlags {
    Friend = 0x01,
    Nature = 0x02,
    Hostile = 0x04,
    All = Friend | Nature | Hostile,
}


export class DEffectFieldScope {
    area: DEffectFieldScopeArea;
    range: DEffectFieldScopeRange;
    length: number;
    projectilePrefabKey: string;    // range が XXProjectile の時に使う projectile
    layers: DBlockLayerKind[];
    layerScope: DBlockLayerScope;
    factions: DEffectScopeTargetFactionFlags;

    public constructor() {
        this.area = DEffectFieldScopeArea.Room,
        this.range = DEffectFieldScopeRange.Performer,
        this.length = -1,
        this.projectilePrefabKey = "";
        this.layers = [DBlockLayerKind.Unit];
        this.layerScope = DBlockLayerScope.TopOnly;
        this.factions = DEffectScopeTargetFactionFlags.All;
    }
}


export enum DBuffMode {
    Strength = "strength",
    Weakness = "weakness",
}

export enum DBuffType {
    Add,
    Mul,
}

export enum DBuffLevelOp {
    Set,
    Add,
}

export interface DParamBuff {
    paramId: DParameterId;
    type: DBuffType;
    //mode: DBuffMode,
    levelType: DBuffLevelOp;
    level: number;
    turn: number;
    //formula: string;
}


export interface DEffectConditions {
    kindId: DEntityCategoryId;

    /** 判定する RaceId。 0 の場合は対象外。 */
    raceId: DRaceId;
    
    applyRating: number;  // EnemyAction と同じ整数。0 はレート無し
    

    fallback: boolean;
}





export class DEffect {
    readonly id: DEffectId;
    readonly key: string;


    subEntityFindKey: DSubEntityFindKey;
    conditions: DEffectConditions;
    
    /** @see {@link IEffectProps.critical} */
    critical: boolean;

    /**
      * IDataSkill.successRate
      * IDataItem.successRate
      * 整数値。0~100
      */
    successRate: number;

    hitType: DEffectHitType;

    /**
      * ターゲット側アニメーション。
      * なお、ユーザー側アニメーションは Effect ではなく Item や Skill 側に付く点に注意。
      * Item が複数の Effect を持つときでも、ユーザー側は Item 自体に対応する見た目の動作をとる。
      * 
      * undefined はデフォルトのアニメーションを使う。
      * null はアニメーションを再生しないことを示す。
      */
    flavorEffect: DFlavorEffect | undefined | null;


    /**
      * IDataSkill.damage
      * IDataItem.damage
      */
     parameterQualifyings: DParameterQualifying[];

     /**
      * パラメータ変化以外のすべてのエフェクト。
      * これらを実現するにはコードで頑張る必要がある。
      * ほとんどの特殊効果はこれを持つ必要があるはず。
      * コアスクリプトだと EFFECT_XXXX に相当する。
      * 
      * @deprecated see effectBehaviors
      */
     otherEffectQualifyings: DOtherEffectQualifying[];
 
     effectBehaviors: DSpecialEffectRef[];
  
     /**
      * IDataSkill.effects
      * IDataItem.effects
      */
     rmmzSpecialEffectQualifyings: IDataEffect[];
  
     /**
      * ステート追加。単に追加するだけなら specialEffectQualifyings から指定することも可能。
      * こちらはレベルと共に指定できる。
      */
     buffQualifying: DParamBuff[];
     

    //rejectionLevel: DEffectRejectionLevel;
    


    constructor(id: DEffectId, key: string) {
        this.id = id;
        this.key = key;
        //this.id = id;
        //this.scope = {
        //    area: DEffectFieldScopeArea.Room,
        //    range: DEffectFieldScopeRange.Front1,
        //    length: -1,
        //    projectilePrefabKey: "" };
        this.subEntityFindKey = { kindId: 0, key: undefined };
        this.conditions = { kindId: 0, raceId: 0, applyRating: 0, fallback: false };
        this.critical = false;
        this.successRate = 100;
        this.hitType = DEffectHitType.Certain;

        // デフォルトは表示無し。この Effect を Skill から使う場合はそちらで undefined が設定されれば、デフォルトのアニメーションが使われる。
        this.flavorEffect = null;
        
        this.parameterQualifyings = [];
        this.otherEffectQualifyings = [];
        this.effectBehaviors = [];
        this.rmmzSpecialEffectQualifyings = [];
        this.buffQualifying = [];
    }

    public applyProps(props: IEffectProps): void {
        if (props.conditions) {
            if (props.conditions.targetCategoryKey) {
                this.conditions.kindId = MRData.getEntityCategory(props.conditions.targetCategoryKey).id;
            }
            if (props.conditions.targetRaceKey) {
                this.conditions.raceId = MRData.getRace(props.conditions.targetRaceKey).id;
            }
            if (props.conditions.rating) {
                this.conditions.applyRating = props.conditions.rating;
            }
            if (props.conditions.fallback) {
                this.conditions.fallback = props.conditions.fallback;
            }
        }

        this.critical = props.critical ?? this.critical;
        this.flavorEffect = props.flavorEffect ? new DFlavorEffect(props.flavorEffect) : this.flavorEffect;
        
        // damageEffects
        if (props.parameterDamages) {
            for (const p of props.parameterDamages) {
                const d = new DParameterQualifying(
                    MRData.getParameter(p.parameterKey).id,
                    p.formula,
                    DHelpers.stringToEnum(p.type, {
                        "damage": DParameterEffectApplyType.Damage,
                        "recover": DParameterEffectApplyType.Recover,
                        "drain": DParameterEffectApplyType.Drain,
                        "_": DParameterEffectApplyType.Damage,
                    }));
                d.applyTarget = DHelpers.stringToEnum(p.point, {
                    "actual": DValuePoint.Actual,
                    "growth": DValuePoint.Growth,
                    "_": DValuePoint.Actual,
                });
                if (p.conditionFormula) {
                    d.conditionFormula = p.conditionFormula;
                }
                if (p.conditionFallback) {
                    d.fallback = p.conditionFallback;
                }
                d.silent = p.silent ?? d.silent;
                this.parameterQualifyings.push(d);
            }
        }

        // buffEffects
        if (props.parameterBuffs) {
            for (const p of props.parameterBuffs) {
                const d: DParamBuff = {
                    paramId: MRData.getParameter(p.parameterKey).id,
                    type: DHelpers.stringToEnum(p.type, {
                        "constant": DBuffType.Add,
                        "ratio": DBuffType.Mul,
                    }),
                    levelType: DHelpers.stringToEnum(p.levelOp, {
                        "add": DBuffLevelOp.Add,
                        "set": DBuffLevelOp.Set,
                        "_": DBuffLevelOp.Add,
                    }),
                    level: p.level,
                    turn: p.turn,
                };
                this.buffQualifying.push(d);
            }
        }

        // specialEffects
        if (props.specialEffects) {
            for (const p of props.specialEffects) {
                this.effectBehaviors.push(DSpecialEffect.makeSpecialEffectRef(p));
            }
        }
    }

    public copyFrom(src: DEffect): void {
        //this.scope = { ...src.scope };
        this.subEntityFindKey = { ...src.subEntityFindKey };
        this.conditions = { ...src.conditions };
        this.critical = src.critical;
        this.successRate = src.successRate;
        this.hitType = src.hitType;
        this.flavorEffect = src.flavorEffect;
        
        this.parameterQualifyings = src.parameterQualifyings.map(x => x.clone());
        this.otherEffectQualifyings = src.otherEffectQualifyings.slice();
        this.effectBehaviors = src.effectBehaviors.slice();
        this.rmmzSpecialEffectQualifyings = src.rmmzSpecialEffectQualifyings.slice();
        this.buffQualifying = src.buffQualifying.slice();
        // this.qualifyings = {
        //     parameterQualifyings: src.qualifyings.parameterQualifyings.slice(),
        //     otherEffectQualifyings: src.qualifyings.otherEffectQualifyings.slice(),
        //     effectBehaviors: src.qualifyings.effectBehaviors.slice(),
        //     rmmzSpecialEffectQualifyings :src.qualifyings.rmmzSpecialEffectQualifyings.slice(),
        //     buffQualifying: src.qualifyings.buffQualifying.slice(),
        // };
        //this.rejectionLevel = src.rejectionLevel;
    }

    public hasAnyValidEffect(): boolean {
        return  this.parameterQualifyings.length > 0 ||
                this.otherEffectQualifyings.length > 0 ||
                this.effectBehaviors.length > 0 ||
                this.rmmzSpecialEffectQualifyings.length > 0 ||
                this.buffQualifying.length > 0;
        
    }

    public hasCondition(): boolean {
        if (this.conditions.kindId != 0) return true;
        if (this.conditions.raceId != 0) return true;
        if (this.conditions.applyRating != 0) return true;
        if (this.conditions.fallback) return true;
        return false;
    }
}

export enum DSkillCostSource {
    /** スキルの使用者 */
    Actor,

    /** スキルの発生元となった Entity。杖を振ったときは、振った人が Actor, 杖アイテムが Item. */
    Item,
}

export enum DParamCostType {
    Decrease,
    Increase,
}

export interface DParamCost {
    type: DParamCostType;
    value: number;
}


export class DEmittorCost {
    

    /** Cost [DSkillCostSource][DParameterId] */
    paramCosts: DParamCost[][];
    
    constructor() {
        this.paramCosts = [];
    }
    

    public setParamCost(source: DSkillCostSource, paramId: DParameterId, paramCost: DParamCost): void {
        let costs = this.paramCosts[source];
        if (!costs) {
            costs = [];
            this.paramCosts[source] = costs;
        }

        costs[paramId] = paramCost;
    }


    
}

export class DEffectSet {

    /** 使用者に対して与える効果 */
    selfEffectId: DEffectId;

    /**
     *  対象への効果が成功したときのみ、使用者に与える効果。
     * v0.5.0時点ではもろはの杖しか使っていないが、他にもしあわせ草の武器印の効果等に使える。
     */
    succeededSelfEffect: DEffect | undefined;
    
    /** 対象に対して与える効果。matchConditions を判定して、最終的に適用する Effect を決める */
    effectIds: DEffectId[];

    public constructor(sourceKey: string) {
        this.selfEffectId = MRData.newEffect(sourceKey).id;
        this.effectIds = [];
    }

    public get selfEffect(): DEffect {
        return MRData.effects[this.selfEffectId];
    }
    
    public effects(): readonly DEffect[] {
        return this.effectIds.map(x => MRData.effects[x]);
    }

    public effect(index: number): DEffect {
        return MRData.effects[this.effectIds[index]];
    }

    public clearEffects(): void {
        this.effectIds = [];
    }

    public setEffect(index: number, value: DEffect): void {
        this.effectIds[index] = value.id;
    }

    public addEffect(value: DEffect): void {
        this.effectIds.push(value.id);
    }

    public copyFrom(src: DEffectSet): void {
        this.selfEffect.copyFrom(src.selfEffect);
        this.effectIds = [];
        for (const id of src.effectIds) {
            this.effectIds.push(MRData.cloneEffect(MRData.effects[id]).id);
        }
    }

    public hitType(): DEffectHitType {
        return this.effect(0).hitType;
    }
}



//------------------------------------------------------------------------------
// Props

export interface IEffectProps {
    conditions?: IEffectConditionsProps;

    
    /**
     * 対象へダメージを与えるときにクリティカル判定を行うかかどうか。
     * 
     * 前方3方向など複数攻撃対象がいる場合は個別にクリティカルが発生することになる。
     * 攻撃の発生元での会心判定は Action として行うこと。
     * 
     * IDataSkill.damage.critical
     */
    critical?: boolean;

    /**
     * パラメータへのダメージ・回復効果のリスト。
     */
    parameterDamages?: IParameterDamageEffectProps[];

    /**
     * パラメータへのバフ・デバフ効果のリスト。
     */
    parameterBuffs?: IParameterBuffEffectProps[];

    /**
     * 特殊効果のリスト。
     */
    specialEffects?: ISpecialEffectProps[];

    /**
     * この Effect が発生するときに再生する FlavorEffect。
     */
    flavorEffect?: IFlavorEffectProps;
}

export interface IEffectConditionsProps {


    targetCategoryKey?: string;

    /** 判定する RaceId。 0 の場合は対象外。 */
    targetRaceKey?: string;
    
    /** EnemyAction と同じ整数。0 はレート無し。 */
    rating?: number;
    
    fallback?: boolean;


    /*
    基本の考えは RMMZ イベントの [出現条件] と同じ。
    条件は AND。設定されているものが全て満たされていれば、マッチする。
    ただし、全く未設定の場合は無条件で有効となる。

    選択処理は次の通り。
    - 条件が何も設定されてないものは常に発動する。
       複数ある場合は同時に発動する。
        他に条件指定がある Effect とも同時発動する。
    - 条件が設定されているものは次のように選択する。
        - まず条件が設定されているものをフィルタリングする。
        - rating を持つものがひとつでもある場合、rating が 1 以上の Effect を対象にランダム選択する。
        - rating が 0 のものは常に発動する。
        - 上記の結果ひとつも実行できるものが無い場合、fallback の Effect を発動する。


    
    */
   
}

/**
 * パラメータへのダメージ・回復効果。
 */
export interface IParameterDamageEffectProps {
    parameterKey: string;

    /**
     * Effect を適用する条件式。
     * 
     * ダメージ計算式と同様のオペランドが使用できます。 `a.hp < 100` とすると、対象の HP が 100 未満のときに効果が発生します。
     * 省略した場合は常に効果が発生します。
     */
    conditionFormula?: string;

    /**
     * true を指定すると、いずれの条件式にもマッチしない場合、効果が発生します。
     */
    conditionFallback?: boolean;

    /**
     * どのパラメータ要素に対して効果を与えるかを指定します。(default: actual)
     * 
     * - actual: 現在値
     * - growth: 成長値 (最大値の算出基準)
     */
    point?: ("actual" | "growth");

    type?: ("damage" | "recover" | "drain");

    /**
     * ダメージ計算式。
     */
    formula: string;

    silent?: boolean;
}

/**
 * パラメータへのバフ・デバフ効果。
 */
export interface IParameterBuffEffectProps {
    parameterKey: string;
    type: ("constant" | "ratio");

    /** (省略した場合は add) */
    levelOp?: ("add" | "set"),
    level: number;
    turn: number;
}


