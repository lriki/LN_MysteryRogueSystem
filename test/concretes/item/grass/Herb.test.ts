import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

/*
[2021/12/18] 回復効果のアンデッド系のダメージ
----------
"炎" や "闇" といった属性と同列の "回復" という属性を持たせるべきか？
http://newrpg.seesaa.net/article/482915499.html
そのように設定して、アンデッドダメ―ジを実現するプラグインはある。

でも別系列にしたい意見も多そうだ。
https://forum.tkool.jp/index.php?threads/%E7%99%92%E3%81%97%E3%83%BB%E5%9B%9E%E5%BE%A9%E3%81%AF%E5%B1%9E%E6%80%A7%E3%81%AB%E5%BD%93%E3%81%A6%E3%81%AF%E3%81%BE%E3%82%8B%E3%81%8B.4004/

例えば、
- 機械属性の回復効果は、機械系にしか効かない
- 機械属性の攻撃効果は、機械系以外にも効く
- 光属性の回復効果は、アンデッド系にダメージ
- 光属性の攻撃効果は、アンデッド系にダメージ

"機械回復" "光回復" みたいな属性を作る？
→ 管理がちょい面倒。属性がかかわるすべてに、２つの情報を設定しなければならない。

"ダメージ時の属性有効度" "回復時の属性有効度" を分けて設定できるようにする？
→ 妥当かも。設定が無ければ RMMZ の標準のを使う。

[2021/12/19] 
----------
アンデッドでも、HPパラメータ以外は回復効果を受けるとか、
アンデッドじゃなくても毒消し草でダメージを受けるとかいろいろあるが…？

特に毒消しダメージは、毒消し草本来の効果である power には関係のない hp ダメージになるため、rate で何とかできない。
条件付きの SubEffect とする必要がある。

また回復時のダメージRateを Trait で設定するにしても、trait が持てる情報量の都合上、たとえば
「光属性のhp回復だけ、-100%にしたい」といったことができない。
「光属性のhp回復をダメージにする」ならできるが。

毒消しダメージについては、モンスター側に Tag のようなものを持たせてしまうのが一番手っ取り早い。
SubEffect 側では、この Tag を持っているかどうかを条件とする。
系統という新たなデータを設けてもよいが、Tag 的な使い方以上の用途は無いかも。

そうすると薬草のHPダメージの実装方法は２つある。
- 薬草アイテム側で判断。アンデッドTagが付いていたら、SubEffect 有効にする。
- Enemy entity 側で判断。HPパラメータへの回復効果は、ダメージとする。
後者の場合、設定は楽だがあらゆる回復効果がダメージとなるため、注意が必要。
やはり属性しても欲しいところ。

とりあえず、どのみち毒消しダメージの実装には Tag を使わなければならないので、薬草もこれを使って実装してみる。
属性が欲しくなったらまた実装を追加する方向で行ってみる。

[2021/12/19] 種族
----------

RMMZ 標準では「炎属性かつ竜特効」みたいな武器やスキルを作ることはできない。

なお、
- スキルと武器で異なる属性が付いていた場合、スキルが優先される。(Game_Action.prototype.calcElementRate)
- 武器の特徴である「属性有効度」は、「属性耐性」のこと。

Race を設けてみたらどうだろう。
Battler は複数の Race を持つ。アンデッドかつ竜とかできる。
Race は Class として定義してみる。オマケ的に、これによって共通の Trait が使えるようにする。

特効効果は RMMZ の属性とは完全に独立することになる。

設定は属性耐性とは異なる方法となる。
つまり、スキルの Effect, 武器の Trait として設定する。
設定対象の種類によって設定方法が異なるので混乱しないように注意。
特定の Race に対するダメージ倍率を指定する。

攻撃側の情報として設定することで、印の重ね掛け等による倍率補正を計算しやすくなる点もメリット。



*/


test("concretes.item.grass.Herb", () => {
    TestEnv.newGame();
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kキュアリーフ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kキュアリーフ").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ワープしている
    expect(enemy1.x == 15 && enemy1.y == 10).toBeFalsy();

    //----------------------------------------------------------------------------------------------------
    
    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ワープしている
    expect(player1.x == 10 && player1.y == 10).toBeFalsy();

    TestUtils.testCommonGrassEnd(player1, item1);
});

