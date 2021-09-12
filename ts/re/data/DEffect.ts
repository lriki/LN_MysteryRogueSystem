import { assert } from "ts/re/Common";
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

export type DEmittorId = number;

export class DEffect {

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


    targetQualifyings: DQualifyings;

    selfQualifyings: DQualifyings;

    constructor() {
        //this.id = id;
        //this.scope = {
        //    area: DEffectFieldScopeArea.Room,
        //    range: DEffectFieldScopeRange.Front1,
        //    length: -1,
        //    projectilePrefabKey: "" };
        this.critical = false;
        this.successRate = 100;
        this.hitType = DEffectHitType.Certain;
        this.rmmzAnimationId = 0;
        this.targetQualifyings = {
            parameterQualifyings: [],
            otherEffectQualifyings: [],
            specialEffectQualifyings : [],
            buffQualifying: [],
        };
        this.selfQualifyings = {
            parameterQualifyings: [],
            otherEffectQualifyings: [],
            specialEffectQualifyings : [],
            buffQualifying: [],
        };
    }

    public copyFrom(src: DEffect): void {
        //this.scope = { ...src.scope };
        this.critical = src.critical;
        this.successRate = src.successRate;
        this.hitType = src.hitType;
        this.rmmzAnimationId = src.rmmzAnimationId;
        
        this.targetQualifyings = {
            parameterQualifyings: src.targetQualifyings.parameterQualifyings.slice(),
            otherEffectQualifyings: src.targetQualifyings.otherEffectQualifyings.slice(),
            specialEffectQualifyings :src.targetQualifyings.specialEffectQualifyings.slice(),
            buffQualifying: src.targetQualifyings.buffQualifying.slice(),
        };
        this.selfQualifyings = {
            parameterQualifyings: src.selfQualifyings.parameterQualifyings.slice(),
            otherEffectQualifyings: src.selfQualifyings.otherEffectQualifyings.slice(),
            specialEffectQualifyings :src.selfQualifyings.specialEffectQualifyings.slice(),
            buffQualifying: src.selfQualifyings.buffQualifying.slice(),
        };
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

/**
 * RMMZ の Skill と Item の共通パラメータ
 */
export class DEmittor {
    id: DEmittorId;

    /**
     * Cost は Emittor が持つ。
     * 杖から出る魔法弾がイメージしやすいかも。
     * 新種道具を考えると、魔法弾には複数の Effect が込められているが、
     * 使用回数は魔法弾1つにつき1つ減る。
     */
    costs: DEmittorCost;
    
    /**
     * 効果適用範囲
     * 
     * Skill が持つべきではないのか？
     * ----------
     * RMMZのスコープと同じ名前を使ってるから紛らわしいかも。
     * DSkill.rmmzEffectScope のコメントと併せて参照してほしいが、
     * こちらの scope は「実際に盤面上のどの範囲に効果を出すか」を決めるものである。
     * 
     * ゾワゾワの巻物などが分かりやすいか。これは使う(読む)ことで Performer の周囲8マスに効果を発動する。Ornament は発生しない直接適用。
     * 薬草など草は、使う(飲む)ことで、Performer 自身に効果を適用する。
     * 矢は使う(撃つ)ことで、スタックを減らし投射する。
     * 壺は、使う=入れたアイテムを消費or[押す]で詰め物を消費、と考えると抽象化しやすいかも。ユニークな効果が多いのでBehavior実装多めになるけど。
     * 
     * 本当は Item と Effect を分離してエディタで設定できる方が、実は自然なのかもしれない。新種道具とか考えると特に。
     * 
     * 内部的にはもしかして Effect を ID や Key で参照できるようにした方がいいかも？
     * ↓
     * アリかもしれない。RMMZのSkillとItem の Effect 部分を固有のIDを持つデータとして取り出しておく。
     * 今は Item(火炎草など) は ブレスSkill を参照しているが、実際に欲しいのはその中にある Effect.
     * SkillやItemは主に Effect 発動の前段となる、発動条件を定義するために主に使う。あとは発動時メッセージなど。Effect の入れ物と考えたほうがいいかも。
     */
    scope: DEffectFieldScope;

    effect: DEffect;
    
    constructor(id: DEmittorId) {
        this.id = id;
        this.costs = new DEmittorCost();
        this.scope = {
            area: DEffectFieldScopeArea.Room,
            range: DEffectFieldScopeRange.Front1,
            length: -1,
            projectilePrefabKey: ""
        };
        this.effect = new DEffect();
    }
    
    public copyFrom(src: DEmittor): void {
        this.scope = { ...src.scope };
        this.effect.copyFrom(src.effect);
    }
}


/** Effect の発生要因。実際にどれを選択するかは Behavior に依る。 */
export enum DEffectCause {
    /** 効果範囲内の対象へのスキル効果適用。通常攻撃、魔法など。 */
    Affect,

    /** 食べる。飲む。命中判定は行わず必中。 */
    Eat,

    /** 飛翔体として衝突。草効果の壺などはこれ。 */
    Hit,
}

export class DEffectSet {
    // 1つの cause に複数の Emittor を持つ必要がある。
    // 例えばドラゴン草は、[飲む] に対応して 「"自分の" FPを5回復する」「"相手に" 炎を飛ばす」といったスコープの異なる2つの効果がある。
    private _emittors: (DEmittor[] | undefined)[] = [];
    //private _mainEmittor: DEmittor | undefined;

    private _skills: (DSkill | undefined)[] = [];

    public setMainEmittor(emittor: DEmittor): void {
        this._emittors[DEffectCause.Affect] = [emittor];
    }

    public addEmittor(cause: DEffectCause, emittor: DEmittor): void {
        const list = this.aquireEmittorList(cause);
        list.push(emittor);
    }

    public setSkill(cause: DEffectCause, value: DSkill): void {
        this._skills[cause] = value;
    }

    public mainEmittor(): DEmittor {
        const list = this._emittors[DEffectCause.Affect];
        assert(list);
        return list[0];
    }

    public emittors(cause: DEffectCause): DEmittor[] {
        const list = this._emittors[cause];
        return list ? list : [];
    }

    public skill(cause: DEffectCause): DSkill | undefined {
        return this._skills[cause];
    }

    /*
    public aquireEmittor(cause: DEffectCause): DEmittor {
        let effect = this._emittors[cause];
        if (effect) {
            return effect;
        }
        else {
            effect = REData.newEmittor();
            this._emittors[cause] = effect;
            return effect;
        }
    }
    */

    private aquireEmittorList(cause: DEffectCause): DEmittor[] {
        let list = this._emittors[cause];
        if (list) {
            return list;
        }
        else {
            list = [];
            this._emittors[cause] = list;
            return list;
        }
    }

    //public addParamQualifying(data: DParameterQualifying): void {
//
    //}


}
