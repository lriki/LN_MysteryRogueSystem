import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRBasics } from "ts/mr/data/MRBasics";

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


test("concretes.item.grass.Herb.player", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const player1HpMax1 = player1.getParamActualMax(MRBasics.params.hp);
    
    // [食べる] (HP Max)
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大HPが増えている
    const player1HpMax2 = player1.getParamActualMax(MRBasics.params.hp);
    expect(player1HpMax2).toBeGreaterThan(player1HpMax1);
    expect(MRLively.messageHistory.includesText("最大HP")).toBeTruthy();
    expect(MRLively.messageHistory.includesText("増えた")).toBeTruthy();  // "回復した" ではないこと

    TestUtils.testCommonGrassEnd(player1, item1);

    //----------------------------------------------------------------------------------------------------

    // 適当に HP を減らしておく
    player1.setParamCurrentValue(MRBasics.params.hp, Math.max(player1HpMax1 - 50, 1));
    const player1Hp1 = player1.getActualParam(MRBasics.params.hp);
    
    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // HPが回復している
    const player1Hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(player1Hp2).toBeGreaterThan(player1Hp1 + 5); // 自動回復も行われるので、少し offset つける
});

test("concretes.item.grass.Herb.enemy", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const enemy1HpMax1 = enemy1.getParamActualMax(MRBasics.params.hp);
    
    // [投げる] (HP Max)
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大HPは変わらない
    const enemy1HpMax2 = enemy1.getParamActualMax(MRBasics.params.hp);
    expect(enemy1HpMax2).toBe(enemy1HpMax1);

    //----------------------------------------------------------------------------------------------------

    // 適当に HP を減らしておく
    enemy1.setParamCurrentValue(MRBasics.params.hp, Math.max(enemy1HpMax1 - 50, 1));
    const enemy1Hp1 = enemy1.getActualParam(MRBasics.params.hp);
    
    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // HPが回復している
    const enemy1Hp2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(enemy1Hp2).toBeGreaterThan(enemy1Hp1);
});

test("concretes.item.grass.Herb.undead", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    const enemy1Hp1 = enemy1.getActualParam(MRBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ダメージを受けている
    const enemy2Hp1 = enemy1.getActualParam(MRBasics.params.hp);
    expect(enemy2Hp1).toBeLessThan(enemy1Hp1);
});

