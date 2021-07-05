import { assert } from "ts/Common";
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

    /** 分散度 */
    variance: number;
}

//export interface DRmmzItemEffectQualifying {
//    effect: IDataEffect,
//}

export interface DPerformeSkillQualifying {
}

export interface DOtherEffectQualifying {
    key: string,
}

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
    Front1,
    StraightProjectile,
    PointProjectile,        // 投石やスカイドラゴンの炎
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

/**
 * RMMZ の Skill と Item の共通パラメータ
 */
export interface DEffect {
    
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
     * 壺は、使う=入れたアイテムを消費or[押す]で詰め物を消費、と考えると抽象化しやすいかも。ユニークな効果が多いのでBehavior実装大目になるけど。
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

    /**
     * IDataSkill.damage
     * IDataItem.damage
     */
    parameterQualifyings: DParameterQualifying[];
    //rmmzItemEffectQualifying: DRmmzItemEffectQualifying[];
    //performeSkillQualifyings: DPerformeSkillQualifying[];
    otherEffectQualifyings: DOtherEffectQualifying[];

    /**
     * IDataSkill.effects
     * IDataItem.effects
     */
    specialEffectQualifyings: IDataEffect[];
}

export function DEffect_Default(): DEffect {
    return {
        scope: {
            area: DEffectFieldScopeArea.Room,
            range: DEffectFieldScopeRange.Front1,
            length: -1,
            projectilePrefabKey: "" },
        critical: false,
        successRate: 100,
        hitType: DEffectHitType.Certain,
        rmmzAnimationId: 0,
        parameterQualifyings: [],
        //rmmzItemEffectQualifying: [],
        //performeSkillQualifyings: [],
        otherEffectQualifyings: [],
        specialEffectQualifyings: [],
    };
};

export function DEffect_Clone(s: DEffect): DEffect {
    return {
        scope: { ...s.scope },
        critical: s.critical,
        successRate: s.successRate,
        hitType: s.hitType,
        rmmzAnimationId: s.rmmzAnimationId,
        parameterQualifyings: s.parameterQualifyings.slice(),
        //rmmzItemEffectQualifying: s.rmmzItemEffectQualifying.slice(),
        //performeSkillQualifyings: s.performeSkillQualifyings.slice(),
        otherEffectQualifyings: s.otherEffectQualifyings.slice(),
        specialEffectQualifyings: s.specialEffectQualifyings.slice(),
    };
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
    private _effects: (DEffect | undefined)[] = [];
    private _skills: (DSkill | undefined)[] = [];

    public setEffect(cause: DEffectCause, value: DEffect): void {
        this._effects[cause] = value;
    }

    public setSkill(cause: DEffectCause, value: DSkill): void {
        this._skills[cause] = value;
    }

    public mainEffect(): DEffect {
        const e = this._effects[DEffectCause.Affect];
        assert(e);
        return e;
    }

    public effect(cause: DEffectCause): DEffect | undefined {
        return this._effects[cause];
    }

    public skill(cause: DEffectCause): DSkill | undefined {
        return this._skills[cause];
    }

    public aquireEffect(cause: DEffectCause): DEffect {
        let effect = this._effects[cause];
        if (effect) {
            return effect;
        }
        else {
            effect = DEffect_Default();
            this._effects[cause] = effect;
            return effect;
        }
    }

    //public addParamQualifying(data: DParameterQualifying): void {
//
    //}


}

