import { DState, DStateId, DStateRestriction } from "ts/re/data/DState";
import { LandExitResult, REData } from "ts/re/data/REData";
import { REGame } from "../REGame";
import { LBehavior, LGenerateDropItemCause } from "ts/re/objects/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { RESystem } from "ts/re/system/RESystem";
import { REBasics } from "ts/re/data/REBasics";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { LParamSet } from "../LParam";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DActionId } from "ts/re/data/DAction";
import { UAction } from "ts/re/usecases/UAction";
import { SStepPhase } from "ts/re/system/SCommon";

export class LExperiencedBehavior extends LBehavior {

    /*
    [2021/12/14] レベルと経験値はパラメータ扱いしたほうがよい？
    ----------
    パラメータ扱いしておくと、レベルダウンや経験値取得の効果をパラメータダメージとして指定できるようになる。
    レベル吸収とかも。

    バフああんまりつけたくないかも？
    一時的にレベルアップ・レベルダウンといった効果は確かに原作でもあるが…。
    でも本当にそれらを実装するとなったら、バフ扱いの方が都合がよい。

    Enemy,Actor というくくりにするよりは、
    "経験値でレベルアップするBehavior", "経験値関係なくレベルアップするBehavior" に分ける方が自然かも。
    そう考えると、Levelのバフは欲しいかもだけどExpのバフはさすがにいらないかも？
    いやでも経験値ダメージはありえるか…。

    トルネコでは、モンスターも経験値テーブルを持つ。
    http://gamemonster.futene.net/wonder-dungeon/wd_torneko1.html
    進化はしない。

    Level, Exp のほかに、Evolution というパラメータを持たせたらどうだろうか。
    進化レベル。普通の Level とは独立。
    こうしておくと、
    - シレン2の仲間システムが実現しやすい。
    - トルネコ仕様の時は Evolution を使わなければよい。
    基本的な考え方はポケモンと同様。
    Entity は "次に進化する Entity" をデータとして持っておく。
    対応 Level が設定されていれば、レベルアップに伴い Evolution も上昇。それによって ChangeInstance する。

    しあわせ草や天使の種の実装は… 条件付き効果を使う？
    → やめたほうがいいかも。特にシレン2では Ev が上がるのか Lv が上がるのかは勢力に依る。
       しあわせの杖も同様。
    できれば エディタから設定するのは
    - Lv を増減
    - Exp を増減
    - (Ev を増減)
    だけにして、Behavior 側でなんとか解釈を変えたいところ。

    でも解釈を変えるっていうのは、例えば地雷による即死効果を分けた理由と衝突しそう。
    そちらは、Enemy が "爆発" という効果を知らなければならないのは不自然だろう、という背景がある。




    

    */

    constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LExperiencedBehavior);
        return b;
    }




}

