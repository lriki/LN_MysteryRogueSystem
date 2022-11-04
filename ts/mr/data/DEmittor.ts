import { assert } from "../Common";
import { DEntityCategoryId } from "./DCommon";
import { DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeRange, DEffectSet, DEmittorCost } from "./DEffect";
import { DSkill } from "./DSkill";
import { MRData } from "./MRData";


export type DEmittorId = number;


/**
 * RMMZ の Skill と Item の共通パラメータ
 */
 export class DEmittor {
    readonly id: DEmittorId;

    readonly key: string;

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

    targetAreaAnimationId: number;

    /** 発動側 Sequel ID */
    selfSequelId: number;

    effectSet: DEffectSet;
    
    constructor(id: DEmittorId, key: string) {
        this.id = id;
        this.key = key;
        this.costs = new DEmittorCost();
        this.scope = new DEffectFieldScope();
        this.selfAnimationId = 0;
        this.targetAreaAnimationId = 0;
        this.selfSequelId = 0;
        this.effectSet = new DEffectSet(key);
    }

    public applyProps(props: IEmittorProps): void {
        if (props.targetEffectKeys) {
            this.effectSet.clearEffects();
            for (const key of props.targetEffectKeys) {
                const effect = MRData.getEffect(key);
                this.effectSet.addEffect(effect);
            }
        }
    }
    
    public copyFrom(src: DEmittor): void {
        this.scope = { ...src.scope };
        this.effectSet.copyFrom(src.effectSet);
    }
}

//------------------------------------------------------------------------------
// Props

export interface IEmittorProps {
    targetEffectKeys?: string[];
}

