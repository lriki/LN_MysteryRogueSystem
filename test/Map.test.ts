import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
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

test('MapTransfar', () => {

    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // 最初に Player を REシステム管理外の 通常マップに配置しておく
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_DefaultNormalMap, 5, 5);

    TestEnv.performFloorTransfer();

    // 移動できていること
    expect(REGame.map.floorId().equals(TestEnv.FloorId_DefaultNormalMap)).toBe(true);

    //--------------------
    // 


    // Player 入力待ちまで進める
    //RESystem.scheduler.stepSimulation();
    
});
