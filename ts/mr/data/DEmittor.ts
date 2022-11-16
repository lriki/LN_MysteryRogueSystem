import { assert } from "../Common";
import { DEmittorId, DEntityCategoryId } from "./DCommon";
import { DEffectFieldScope, DEffectFieldScopeArea, DEffectFieldScopeType, DEmittorCost, DRmmzEffectScope } from "./DEffect";
import { DEffectRef, DEffectSuite, IEffectRef } from "./DEffectSuite";
import { DHelpers } from "./DHelper";
import { MRData } from "./MRData";

/**
 * RMMZ の Skill と Item の共通パラメータ
 */
 export class DEmittor {
    public readonly id: DEmittorId;
    public readonly key: string;
    public readonly effectSuite: DEffectSuite;

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

    
    constructor(id: DEmittorId, key: string) {
        this.id = id;
        this.key = key;
        this.effectSuite = new DEffectSuite(key);
        this.costs = new DEmittorCost();
        this.scope = new DEffectFieldScope();
        this.selfAnimationId = 0;
        this.targetAreaAnimationId = 0;
        this.selfSequelId = 0;
    }

    public applyProps(props: IEmittorProps): void {
        if (props.scopeType) {
            this.scope.range = DHelpers.stringToEnum(props.scopeType, {
                "front": DEffectFieldScopeType.Front1,
                "_": DEffectFieldScopeType.Performer,
            });
        }

        if (props.targetEffectKeys) {
            this.effectSuite.clearTargetEffects();
            for (const key of props.targetEffectKeys) {
                const effect = MRData.getEffect(key);
                const ref = new DEffectRef(effect.id);
                this.effectSuite.addTargetEffect(ref);
            }
        }
        // NOTE: 追加にするべきか？リセットか？
        // Trait や SpecialEffect はエディタ上でどのような設定がされているのかがわかる。
        // 対して、 Emittor や Effect は MRシステム独自のもので、エディタからは見えない。
        // 見えないのでイメージしづらく、省略されていると見落としの懸念がある。
        // そのためリセットにしておく。
        if (props.targetEffects) {
            this.effectSuite.clearTargetEffects();
            for (const p of props.targetEffects) {
                const effect = MRData.getEffect(p.effectKey);
                const ref = new DEffectRef(effect.id);
                // if (p.conditions) {
                //     if (p.conditions.targetCategoryKey) {
                //         ref.conditions.targetCategoryId = MRData.getEntityCategory(p.conditions.targetCategoryKey).id;
                //     }
                //     if (p.conditions.targetRaceKey) {
                //         ref.conditions.raceId = MRData.getRace(p.conditions.targetRaceKey).id;
                //     }
                //     if (p.conditions.rating) {
                //         ref.conditions.applyRating = p.conditions.rating;
                //     }
                //     if (p.conditions.fallback) {
                //         ref.conditions.fallback = p.conditions.fallback;
                //     }
                // }
                if (p.conditionTargetCategoryKey) {
                    ref.conditions.targetCategoryId = MRData.getEntityCategory(p.conditionTargetCategoryKey).id;
                }
                if (p.conditionTargetRaceKey) {
                    ref.conditions.targetRaceId = MRData.getRace(p.conditionTargetRaceKey).id;
                }
                if (p.conditionRating) {
                    ref.conditions.applyRating = p.conditionRating;
                }
                if (p.conditionFallback) {
                    ref.conditions.fallback = p.conditionFallback;
                }
                this.effectSuite.addTargetEffect(ref);
            }
        }
    }
    
    public copyFrom(src: DEmittor): void {
        this.scope = { ...src.scope };
        this.effectSuite.copyFrom(src.effectSuite);
    }

    public setupFromRmmzScope(rmmzScope: DRmmzEffectScope): void {
        switch (rmmzScope) {
            case DRmmzEffectScope.Opponent_Single:
                this.scope.range = DEffectFieldScopeType.Front1;
                break;
            case DRmmzEffectScope.Opponent_All:
                this.scope.range = DEffectFieldScopeType.Room;
                break;
            default:
                this.scope.range = DEffectFieldScopeType.Performer;
                break;
        }
    }
}

//------------------------------------------------------------------------------
// Props

export interface IEmittorProps {
    scopeType?: ("front");

    /** @deprecated */
    targetEffectKeys?: string[];

    /**
     * この Emittor によって発動される Effect のリストです。
     * 必要に応じて発動条件を指定できます。
     * 
     * このリストを設定すると、 EntityTemplate によってリンクされる Emittor と Effect の関連付けはリセットされます。
     * つまりこのリストには、Emittor が発動する Effect をすべて指定する必要があります。
     */
    targetEffects?: IEffectRef[];
}

