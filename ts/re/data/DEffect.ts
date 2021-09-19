import { assert } from "ts/re/Common";
import { DMatchConditions } from "./DCommon";
import { DParameterId } from "./DParameter";
import { DSkill } from "./DSkill";



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

export interface DParameterQualifying {
    parameterId: DParameterId;

    elementId: number;  // (Index of DSystem.elements)

    formula: string;

    /** IDataSkill.damage.type  */
    applyType: DParameterEffectApplyType;

    /** 分散度 (%) */
    variance: number;

    /** メッセージを出さないようにする。 */
    silent: boolean;
}

//export interface DRmmzItemEffectQualifying {
//    effect: IDataEffect,
//}

export interface DPerformeSkillQualifying {
}

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
    PointProjectile,        // 投石やスカイドラゴンの炎
    Selection,   // 対象となるアイテムを選択する。識別の巻物など、対象となる持ち物を選んで効果を発動するももの。
    Around, // 周囲
}

export enum DEffectFieldScopeArea {
    Room,
    Floor,
}

export interface DEffectFieldScope {
    area: DEffectFieldScopeArea,
    range: DEffectFieldScopeRange,
    length: number,
    projectilePrefabKey: string,
}


export enum DBuffMode {
    Strength,
    Weakness,
}

export enum DBuffOp {
    Add,
    Mul,
}

export interface DParamBuff {
    paramId: DParameterId;
    mode: DBuffMode,
    level: number;
    levelType: LStateLevelType;
    op: DBuffOp;
    turn: number;
    //formula: string;
}

export interface DQualifyings {

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
       */
     otherEffectQualifyings: DOtherEffectQualifying[];
 
     /**
       * IDataSkill.effects
       * IDataItem.effects
       */
     specialEffectQualifyings: IDataEffect[];
 
     /**
      * ステート追加。単に追加するだけなら specialEffectQualifyings から指定することも可能。
      * こちらはレベルと共に指定できる。
      */
     buffQualifying: DParamBuff[];
     
}

export class DEffect {
    matchConditions: DMatchConditions;
    
    /**
     * 対象へダメージを与えるときにクリティカル判定を行うかかどうか。
     * 前方3方向など複数攻撃対象がいる場合は個別にクリティカルが発生することになる。
     * 攻撃の発生元での会心判定は Action として行うこと。
     * 
     * IDataSkill.damage.critical
     */
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
      */
    rmmzAnimationId: number;


    qualifyings: DQualifyings;

    //selfQualifyings: DQualifyings;

    constructor() {
        //this.id = id;
        //this.scope = {
        //    area: DEffectFieldScopeArea.Room,
        //    range: DEffectFieldScopeRange.Front1,
        //    length: -1,
        //    projectilePrefabKey: "" };
        this.matchConditions = { kindId: 0 };
        this.critical = false;
        this.successRate = 100;
        this.hitType = DEffectHitType.Certain;
        this.rmmzAnimationId = 0;
        this.qualifyings = {
            parameterQualifyings: [],
            otherEffectQualifyings: [],
            specialEffectQualifyings : [],
            buffQualifying: [],
        };
        // this.selfQualifyings = {
        //     parameterQualifyings: [],
        //     otherEffectQualifyings: [],
        //     specialEffectQualifyings : [],
        //     buffQualifying: [],
        // };
    }

    public copyFrom(src: DEffect): void {
        //this.scope = { ...src.scope };
        this.critical = src.critical;
        this.successRate = src.successRate;
        this.hitType = src.hitType;
        this.rmmzAnimationId = src.rmmzAnimationId;
        
        this.qualifyings = {
            parameterQualifyings: src.qualifyings.parameterQualifyings.slice(),
            otherEffectQualifyings: src.qualifyings.otherEffectQualifyings.slice(),
            specialEffectQualifyings :src.qualifyings.specialEffectQualifyings.slice(),
            buffQualifying: src.qualifyings.buffQualifying.slice(),
        };
        // this.selfQualifyings = {
        //     parameterQualifyings: src.selfQualifyings.parameterQualifyings.slice(),
        //     otherEffectQualifyings: src.selfQualifyings.otherEffectQualifyings.slice(),
        //     specialEffectQualifyings :src.selfQualifyings.specialEffectQualifyings.slice(),
        //     buffQualifying: src.selfQualifyings.buffQualifying.slice(),
        // };
    }
    
    public clone(): DEffect {
        const i = new DEffect();
        i.copyFrom(this);
        return i;
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
    selfEffect: DEffect;
    
    /** matchConditions を判定して、最終的に適用する Effect を決める */
    effects: DEffect[];

    public constructor() {
        this.selfEffect = new DEffect();
        this.effects = [];
    }
    
    public copyFrom(src: DEffectSet): void {
        this.selfEffect.copyFrom(src.selfEffect);
        this.effects = [];
        for (const e of src.effects) {
            this.effects.push(e.clone());
        }
    }
}

