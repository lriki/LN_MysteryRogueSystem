import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.Landmine.DamageAndDestruct", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = 8;
    player1.setParamCurrentValue(MRBasics.params.hp, hp1);    // テストしやすいように、割り切れる HP にしておく

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 9);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地雷A").id, [], "trap1"));
    MRLively.world.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp2).toBe(hp1 / 2);  // HP半分になっている
    expect(player1.isDestroyed()).toBe(false);  // 消滅していないこと
    expect(trap1.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(enemy1.isDestroyed()).toBe(true);    // 寄ってきたモンスターは爆発に巻き込まれて即死
    expect(item1.isDestroyed()).toBe(true);     // アイテムは消滅

    const message = MRLively.messageHistory;
    expect(message.countIncludesText("ダメージを受けた")).toBe(1);    // Player の分のダメージ表示だけ出ている。Enemy の分は無いこと。
    expect(message.countIncludesText("倒れた")).toBe(0);            // Enemy 及び Item に対して "倒れた" メッセージの表示は無いこと。

    //----------------------------------------------------------------------------------------------------
    // 端数切り上げのダメージになっているかチェック

    player1.setParamCurrentValue(MRBasics.params.hp, 3);

    // [踏む]
    MRSystem.dialogContext.postActivity(LActivity.makeTrample(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp3 = player1.getActualParam(MRBasics.params.hp);
    expect(hp3).toBe(2);    // 端数切り上げで 2 ダメージ -> 自動回復で1回復

    //----------------------------------------------------------------------------------------------------
    // HP1 の時に爆発したら戦闘不能になるかチェック

    player1.setParamCurrentValue(MRBasics.params.hp, 1);

    // [踏む]
    MRSystem.dialogContext.postActivity(LActivity.makeTrample(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp4 = player1.getActualParam(MRBasics.params.hp);
    expect(hp4).toBe(0);                                // HP0
    expect(player1.isDeathStateAffected()).toBe(true);  // 戦闘不能
    expect(player1.isDestroyed()).toBe(false);          // 消滅していないこと
});

test("concretes.trap.Landmine.InducedExplosion", () => {
    TestEnv.newGame();

    /*
        Ｐ罠
        罠敵
    */

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = 16;
    player1.setParamCurrentValue(MRBasics.params.hp, hp1);    // テストしやすいように、割り切れる HP にしておく

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地雷A").id, [], "trap1"));
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地雷A").id, [], "trap2"));
    MRLively.world.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    MRLively.world.transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 10, 11);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp2).toBe(hp1 / 4);  // HP半分を２回受けている
    expect(player1.isDestroyed()).toBe(false);  // 消滅していないこと
    expect(trap1.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(trap2.isDestroyed()).toBe(false);    // 消滅していないこと
    expect(trap2.getEntityBehavior(LTrapBehavior).exposed()).toBe(true);    // 露出していること
    expect(enemy1.isDestroyed()).toBe(true);    // 寄ってきたモンスターは爆発に巻き込まれて即死
    expect(MRLively.messageHistory.includesText("ダメージを受けた"));    // プレイヤーに対する2回のみダメージ表示がある。
    expect(MRLively.messageHistory.includesText("倒れた"));   // モンスターに対して複数回 "倒れた" が表示されないこと。
});

