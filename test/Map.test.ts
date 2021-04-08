import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";

import "./Extension";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

/*
test('LoadFixedMap', () => {

    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation();





});
*/
