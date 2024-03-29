import { MRLively } from "ts/mr/lively/MRLively";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRData } from "ts/mr/data/MRData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("State_Brace", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 5, 5);

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);

    // 行動できる Entity は Player(行動不能) しかいない状態。
    assert(MRLively.mapView.currentMap.entities().filter(e => e.findEntityBehavior(LUnitBehavior)).length == 1);

    // シミュレーション実行
    MRSystem.scheduler.stepSimulation();

    // ハングせずに stepSimulation を抜けてくればOK.

    // 1回 Simulation しただけでは解除されていないこと。
    expect(actor1.states[0].stateDataId()).toBe(TestEnv.StateId_Sleep);
});

test("State.AutoRemove", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 5, 5);

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);

    const stateObjectId = actor1.states[0].id();

    // 10 ターン分 シミュレーション実行
    for (let i = 0; i < 10; i++) {
        MRSystem.scheduler.stepSimulation();
    }

    // 自然解除されている
    expect(actor1.states.length).toBe(0);

    // State Object も GC で削除されている
    const state = MRLively.world.findEntity(stateObjectId);
    expect(state).toBe(undefined);

});

test("State.Proficiency", () => {
    TestEnv.newGame();
    
    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 5, 5);

    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    MRSystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(actor1, shield1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();
    
    const atk1 = actor1.atk;
    const def1 = actor1.def;
    
    // 武器と防具の強さが 50% になる Trait を持つ State 
    actor1.addState(MRData.getState("kState_UT魔法使い").id);

    const atk2 = actor1.atk;
    const def2 = actor1.def;

    expect(atk1 > atk2).toBe(true);
    expect(def1 > def2).toBe(true);
});
