import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { LScheduler2 } from "ts/mr/lively/LScheduler";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.すばやさ草.eat", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item2"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item3);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる] 1個め
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 倍速になる
    expect(LScheduler2.getSpeedLevel(player1)).toBe(2);
    
    expect(enemy1.mx).toBe(10);  // まだ enemy にターンは回らないので移動していない

    //----------------------------------------------------------------------------------------------------

    // [食べる] 2個め
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 3倍速になる
    expect(LScheduler2.getSpeedLevel(player1)).toBe(3);

    //----------------------------------------------------------------------------------------------------

    // [食べる] 3個め
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item3).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 3倍速以上には増えない
    expect(LScheduler2.getSpeedLevel(player1)).toBe(3);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassEnd(player1, item1);
});

test("concretes.item.grass.すばやさ草.throw", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 倍速状態になる
    expect(LScheduler2.getSpeedLevel(enemy1)).toBe(2);
});

// 速度上昇直後、アイテム拾いを伴う移動を行うと Enemy との Sequel Flush のタイミングがずれる問題の修正確認
test("concretes.item.grass.すばやさ草.2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    //player1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1,floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item2"));
    MRLively.world.transferEntity(undefined, item2, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.mx).toBe(15);

    //----------------------------------------------------------------------------------------------------

    // 右へ移動 > 拾う
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const sets = TestEnv.sequelSets;
    expect(sets.length).toBe(3);
    
    const set = TestEnv.activeSequelSet;
    expect(set.runs().length).toBe(1);
    const clips = set.runs()[0].clips();
    expect(clips.length).toBe(2);
});

