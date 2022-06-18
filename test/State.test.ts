import { REGame } from "ts/mr/objects/REGame";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { RESystem } from "ts/mr/system/RESystem";
import { LUnitBehavior } from "ts/mr/objects/behaviors/LUnitBehavior";
import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { MRData } from "ts/mr/data/MRData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("State_Brace", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);

    // 行動できる Entity は Player(行動不能) しかいない状態。
    assert(REGame.map.entities().filter(e => e.findEntityBehavior(LUnitBehavior)).length == 1);

    // シミュレーション実行
    RESystem.scheduler.stepSimulation();

    // ハングせずに stepSimulation を抜けてくればOK.

    // 1回 Simulation しただけでは解除されていないこと。
    expect(actor1.states()[0].stateDataId()).toBe(TestEnv.StateId_Sleep);
});

test("State.AutoRemove", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);

    const stateObjectId = actor1.states()[0].id();

    // 10 ターン分 シミュレーション実行
    for (let i = 0; i < 10; i++) {
        RESystem.scheduler.stepSimulation();
    }

    // 自然解除されている
    expect(actor1.states().length).toBe(0);

    // State Object も GC で削除されている
    const state = REGame.world.findEntity(stateObjectId);
    expect(state).toBe(undefined);

});

test("State.Proficiency", () => {
    TestEnv.newGame();
    
    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();
    
    const atk1 = actor1.atk;
    const def1 = actor1.def;
    
    // 武器と防具の強さが 50% になる Trait を持つ State 
    actor1.addState(MRData.getState("kState_UT魔法使い").id);

    const atk2 = actor1.atk;
    const def2 = actor1.def;

    expect(atk1 > atk2).toBe(true);
    expect(def1 > def2).toBe(true);
});
