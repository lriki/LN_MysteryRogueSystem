import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LTileShape } from "ts/mr/lively/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

//==============================================================================
// メッキ
//==============================================================================
test("concretes.states.SystemStates.Plating", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // アイテム 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [MRData.getState("kState_System_Plating").id], "shield1"));
    inventory.addEntity(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_錆ワナA").id, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const shield1_UP1 = shield1.getActualParam(MRBasics.params.upgradeValue);

    MRSystem.scheduler.stepSimulation();    //------------------------------
    
    //--------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);   // 乱数調整
    MRSystem.scheduler.stepSimulation();    //------------------------------

    // 装備はさびない
    const shield1_UP2 = shield1.getActualParam(MRBasics.params.upgradeValue);
    expect(shield1_UP2).toBe(shield1_UP1);
    expect(MRLively.messageHistory.includesText("変化しなかった")).toBe(true);    // メッセージとしては "効かなかった" ではなく、パラメータ減少を試行したが意味がなかった旨が記録される
});

//==============================================================================
// 壺割れず
//==============================================================================
// 壁にぶつけた時、壺は割れずに床に落ちる
test("concretes.states.SystemStates.StorageProtection.ToWall", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_System_StorageProtection").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory1.addEntity(item2);
    item2.addState(stateId);

    // Player の右に壁を作る
    MRLively.mapView.currentMap.block(player1.mx + 2, player1.my)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    //------------------------------

    //--------------------------------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    //------------------------------

    // 壺は割れずに床に落ちる
    expect(item2.isDestroyed()).toBeFalsy();
    expect(item2.mx).toBe(11);
    expect(item2.my).toBe(10);
});

// モンスターにぶつけた時、壺爆弾にはならず普通にダメージを与えて消滅する。
test("concretes.states.SystemStates.StorageProtection.ToUnit", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.getState("kState_System_StorageProtection").id;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    item1Inventory.addEntity(item2);
    item1.addState(stateId);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    enemy1.setParamCurrentValue(MRBasics.params.hp, 2); // HPを2にしておく

    MRSystem.scheduler.stepSimulation();    //------------------------------

    //--------------------------------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    //------------------------------

    // 壺は割れずに、普通にダメージを与えて消滅する。
    expect(item1.isDestroyed()).toBeTruthy();
    expect(item2.isDestroyed()).toBeTruthy();
    expect(enemy1.getActualParam(MRBasics.params.hp)).toBe(1);
});
