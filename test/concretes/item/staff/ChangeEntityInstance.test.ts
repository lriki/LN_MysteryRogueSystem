import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.ChangeEntityInstance.Wave", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_変化の杖A").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_飴色スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const entityDataId = enemy1.dataId;

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は [振る] ことができる
    expect(!!item1.queryReactions().find(x => x.actionId == MRBasics.actions.WaveActionId)).toBe(true);
    
    // [振る]
    const activity1 = LActivity.makeWave(actor1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.dataId).not.toBe(entityDataId); // 種類が変わっていること
    expect(enemy1.mx).toBe(12);                  // 変化したターンもモンスターに行動が回り、近づいてくる
});

test("Items.ChangeEntityInstance.Throw", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_変化の杖A").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_飴色スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const entityDataId = enemy1.dataId;

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [投げる]
    const activity = LActivity.makeThrow(actor1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.dataId).not.toBe(entityDataId); // 種類が変わっていること
    expect(enemy1.mx).toBe(12);                  // 変化したターンもモンスターに行動が回り、近づいてくる
});
