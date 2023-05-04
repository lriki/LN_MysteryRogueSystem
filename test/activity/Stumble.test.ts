import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.activity.Stumble.player", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory.addEntity(weapon1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [転ぶ]
    const act = (new LActivity()).setup(MRBasics.actions.stumble, player1);
    MRSystem.dialogContext.postActivity(act.withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 持ち物が前方に落ちてダメージも受けている;
    const item1 = MRLively.mapView.currentMap.block(11, 10).getFirstEntity();
    expect(item1).toBe(weapon1);
});

test("concretes.activity.Stumble.player.wall", () => {
    TestEnv.newGame();

    // 次のような状況で左を向いて転倒する。
    // 壁
    // 壁  Ｐ
    // 壁
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 2, 4);
    player1.dir = 4;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // アイテム 入手
    const items = [];
    for (let i = 0; i < 9; i++) {
        const item1= SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
        inventory.addEntity(item1);
    }

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [転ぶ]
    const act = (new LActivity()).setup(MRBasics.actions.stumble, player1);
    MRSystem.dialogContext.postActivity(act.withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 持ち物が前方に落ちる。壁にはめり込まない。
    expect(MRLively.mapView.currentMap.block(0, 2).getFirstEntity() === undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(0, 3).getFirstEntity() === undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(0, 4).getFirstEntity() === undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(0, 5).getFirstEntity() === undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(0, 6).getFirstEntity() === undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(1, 3).getFirstEntity() !== undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(1, 4).getFirstEntity() !== undefined).toBe(true);
    expect(MRLively.mapView.currentMap.block(1, 5).getFirstEntity() !== undefined).toBe(true);
    expect(inventory.items.length).toBe(6);
});


test("concretes.activity.Stumble.player.onItem", () => {
    TestEnv.newGame();

    // 次のような状況で右を向いて転倒する。
    // 
    // Ｐ草
    // 
    
    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // アイテム 入手
    const items = [];
    for (let i = 0; i < 9; i++) {
        const item1= SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
        inventory.addEntity(item1);
    }

    // アイテムを置く
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_ちからの草A").id, [], "item1"));
    TestEnv.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [転ぶ]
    const act = (new LActivity()).setup(MRBasics.actions.stumble, player1);
    MRSystem.dialogContext.postActivity(act.withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 持ち物が前方に落ちる。壁にはめり込まない。
    expect(MRLively.mapView.currentMap.block(11, 10).getEntities().length === 1).toBe(true);
    expect(inventory.items.length).toBe(2);
});

test("concretes.activity.Stumble.enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy を転ばせて自分は待機
    const act1 = (new LActivity()).setup(MRBasics.actions.stumble, enemy1);
    MRSystem.dialogContext.postActivity(act1);
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 何か足元に落ちてる
    const item1 = MRLively.mapView.currentMap.block(13, 10).getFirstEntity();
    expect(item1 !== undefined).toBe(true);
    expect(enemy1.mx).toBe(12);

    //----------------------------------------------------------------------------------------------------

    // Enemy を転ばせて自分は待機
    const act2 = (new LActivity()).setup(MRBasics.actions.stumble, enemy1);
    MRSystem.dialogContext.postActivity(act2);
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 2回目は何も落とさない
    const item2 = MRLively.mapView.currentMap.block(12, 10).getFirstEntity();
    expect(item2 === undefined).toBe(true);
});

