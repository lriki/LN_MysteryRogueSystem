import { TestEnv } from "./TestEnv";
import { DBasics } from "ts/data/DBasics";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { DialogSubmitMode } from "ts/system/SDialog";
import { SGameManager } from "ts/system/SGameManager";
import { SDebugHelpers } from "ts/system/SDebugHelpers";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('Survival.FP', () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    const behavior = actor1.getBehavior(LBattlerBehavior);
    expect(behavior.actualParam(DBasics.params.fp)).toBe(1000); // 初期 FP は 1000
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(behavior.actualParam(DBasics.params.fp)).toBe(1000); // Dialog 開いた状態なので未行動。FP消費はされていない。

    const dialogContext = RESystem.dialogContext;

    // 移動
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(behavior.actualParam(DBasics.params.fp)).toBe(999);  // FP が減少していること

    const prevHP = behavior.actualParam(DBasics.params.hp);

    // FP 0 にしてから移動してみる
    SDebugHelpers.setFP(actor1, 0);
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(behavior.actualParam(DBasics.params.hp)).toBe(prevHP - 1);   // HP が減少していること
});
