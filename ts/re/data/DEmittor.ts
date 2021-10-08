import { assert } from "../Common";
import { DEntityKindId } from "./DCommon";
import { DEffect, DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeRange, DEffectSet, DEmittorCost } from "./DEffect";
import { DSkill } from "./DSkill";


export type DEmittorId = number;


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

    /** 発動側アニメーションID */
    selfAnimationId: number;

    /** 発動側 Sequel ID */
    selfSequelId: number;

    effectSet: DEffectSet;
    
    constructor(id: DEmittorId) {
        this.id = id;
        this.costs = new DEmittorCost();
        this.scope = new DEffectFieldScope();
        this.selfAnimationId = 0;
        this.selfSequelId = 0;
        this.effectSet = new DEffectSet();
    }
    
    public copyFrom(src: DEmittor): void {
        this.scope = { ...src.scope };
        this.effectSet.copyFrom(src.effectSet);
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

export class DEmittorSet {
    // 1つの cause に複数の Emittor を持つ必要がある。
    // 例えばドラゴン草は、[飲む] に対応して 「"自分の" FPを5回復する」「"相手に" 炎を飛ばす」といったスコープの異なる2つの効果がある。
    private _emittors: (DEmittor[] | undefined)[] = [];
    //private _mainEmittor: DEmittor | undefined;

    // private _skills: (DSkill | undefined)[] = [];

    public setMainEmittor(emittor: DEmittor): void {
        this._emittors[DEffectCause.Affect] = [emittor];
    }

    public addEmittor(cause: DEffectCause, emittor: DEmittor): void {
        const list = this.aquireEmittorList(cause);
        list.push(emittor);
    }

    // public setSkill(cause: DEffectCause, value: DSkill): void {
    //     this._skills[cause] = value;
    // }

    public mainEmittor(): DEmittor {
        const list = this._emittors[DEffectCause.Affect];
        assert(list);
        return list[0];
    }

    public emittors(cause: DEffectCause): DEmittor[] {
        const list = this._emittors[cause];
        return list ? list : [];
    }

    // public skill(cause: DEffectCause): DSkill | undefined {
    //     return this._skills[cause];
    // }

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

