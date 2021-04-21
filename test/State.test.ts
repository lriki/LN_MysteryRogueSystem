import { REGame } from "ts/objects/REGame";
import { REGameManager } from "ts/system/REGameManager";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { LFloorId } from "ts/objects/LFloorId";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { TileShape } from "ts/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('State_Brace', () => {
    REGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // "睡眠" 強制付加
    actor1.addState(TestEnv.StateId_Sleep);


    /*


    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // player を右下へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 3));
    dialogContext.closeDialog(true);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 壁があるので移動できていない
    expect(actor1.x).toBe(5);
    expect(actor1.y).toBe(5);
    */
});
