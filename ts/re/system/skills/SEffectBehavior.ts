import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEffectBehaviorId, DSkillId } from "ts/re/data/DCommon";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../SCommandContext";
import { SEffectModifier } from "../SEffectApplyer";


export abstract class SEffectBehavior {

    public onApplyTargetEffect(cctx: SCommandContext, performer: LEntity, modifier: SEffectModifier, target: LEntity): void {
        
    }

    //public onEmittorPerformed(cctx: SCommandContext, self: LEntity, targets: LEntity[]): void {}
     
/*
    public onSelfEffectApplied(cctx: SCommandContext, modifier: SEffectModifier, entity: LEntity) {

    }

    */
}

/*
[2021/10/20] 動作の予防について
----------
- 転び防止
- 盗み防止
- 爆発防止 (冷え香)
- ワープ防止？

当初これらは ActivityReaction でリジェクトすることで対応しようとしてたが、
これらの効果は EffectBehavior からも発動する必要になってきたためちょっと迷い中。

例えば転ばせは Activity でも実現できるが、起点は Effect となるべき。
転ばぬ先の杖、転び石効果、転び土偶、モンスター特技等から実行される。

実際のところ、転び防止、盗み防止くらいなら EffectBehavior 側で相手の Trait を見て、発動しないだけでよい。
Reaction でリジェクトしたいのは、それ以外の条件によってはじきたいとき。
例えば [話す] は、敵対 Entity ならリジェクトしたい。


### Skill と Activity の違い

今のところ、Activity は Core 外部から入力される行動の起点を示すもので、Recorder で記録されるもの、としている。
また、いくつかの Activity はシステムと強く結びついており、[置く] [交換] などは対象を選択する UI が必要となる。

対して Skill は前準備無しで即 "実行" できる。対象を選択する必要はない。（あるいは事前に狙いをつけたものに対して発動する）。Skill には成否・命中判定が伴う。
Skill は複数の Effect を含むことができるため、[転び] と [盗み] を同時に発動できる。
このため Skill == Activity にはできない。同様に Effect == Activity も NG。
SpecialEffect == Activity ならまだ余地はありそうだが、SpecialEffect はステートやバフ付加など Activity 以外の処理を行いたいこともある。

Skill や Effect は [転び] と [盗み] といったアクションと 1:1 にできないので、やっぱり Activity として再利用はできない。


### 防止効果の指定方法

もし Activity に [転び] と [盗み] といったものを実装するなら、防止 Trait は具体的な [転び防止] [盗み防止] ではなく、
[指定IDのActivity防止] にすることができて、汎用性が上がる。
Actor と Reactor 側どちらかを指定できればなおよい。
これができると "巻物忘れ"([読む]ができない) などの実装も容易になる。
→ 現状、Actor 側は SealActivity で実装済み。


### 何を懸念している？→ [転び] [盗み] は Activity なのか？

消去法によるアイデアなので、ほんとによいかちょっと不安。
[移動] [向き変更] [拾う] [置く] [交換] といった行動までリジェクトできるような仕組みでよいのか？
→ 別に構わないと思うし、実際にこれらはありえそう。
  逆に、無理に別の分類にする意味のほうが薄いかもしれない。

ただ、Activity と効果が 1:1 だと面倒なこともある。
例えば [盗む] と一言にいっても、
- アイテム盗み
- ゴールド盗み
- ついばみ
- すいこみ
- アイテムをつかんで投げ捨てる
等が考えられる。
これら一つずつ Activity と 防止 Trait を用意するのはちょっと面倒だし、設定ミスも起こりやすくなる。
こういったケースではやっぱり [盗み防止] Trait ひとつで対応したいところ。

そうするといくつかの効果をグループ化するような仕組みとなるので、[盗み防止] という具体的な Trait になるのもやむなしか。

これら Trait の説明文としては、
- [盗み] に分類される特殊効果を防止します。
- [転び] に分類される特殊効果を防止します。



*/


