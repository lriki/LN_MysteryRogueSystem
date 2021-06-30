import { REGame } from "ts/objects/REGame";
import { SGameManager } from "ts/system/SGameManager";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { LFloorId } from "ts/objects/LFloorId";
import { UMovement } from "ts/usecases/UMovement";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { TileShape } from "ts/objects/LBlock";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { assert } from "ts/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("State_Brace", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);

    // 行動できる Entity は Player(行動不能) しかいない状態。
    assert(REGame.map.entities().filter(e => e.findBehavior(LUnitBehavior)).length == 1);

    // シミュレーション実行
    RESystem.scheduler.stepSimulation();

    // ハングせずに stepSimulation を抜けてくればOK.

    // 1回 Simulation しただけでは解除されていないこと。
    expect(actor1.states()[0].stateId()).toBe(TestEnv.StateId_Sleep);
});

test("State.AutoRemove", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
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
