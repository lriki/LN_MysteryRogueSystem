import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REBasics } from "ts/re/data/REBasics";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { LScheduler2 } from "ts/re/objects/LScheduler";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.すばやさ草.eat", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item2"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item3);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる] 1個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 倍速になる
    expect(LScheduler2.getSpeedLevel(player1)).toBe(2);
    
    expect(enemy1.mx).toBe(10);  // まだ enemy にターンは回らないので移動していない

    //----------------------------------------------------------------------------------------------------

    // [食べる] 2個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 3倍速になる
    expect(LScheduler2.getSpeedLevel(player1)).toBe(3);

    //----------------------------------------------------------------------------------------------------

    // [食べる] 3個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item3).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1,floorId, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item3"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item2"));
    REGame.world.transferEntity(item2, floorId, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.mx).toBe(15);

    //----------------------------------------------------------------------------------------------------

    // 右へ移動 > 拾う
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const sets = TestEnv.sequelSets;
    expect(sets.length).toBe(3);
    
    const set = TestEnv.activeSequelSet;
    expect(set.runs().length).toBe(1);
    const clips = set.runs()[0].clips();
    expect(clips.length).toBe(2);
});

