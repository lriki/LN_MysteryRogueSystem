import { TestEnv } from "./TestEnv";
import { DBasics } from "ts/data/DBasics";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { DialogSubmitMode } from "ts/system/SDialog";
import { SGameManager } from "ts/system/SGameManager";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { DEntity } from "ts/data/DEntity";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/system/SEffectContext";
import { TileShape } from "ts/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("CharacterAI.test", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

});

// 壁角斜め方向への攻撃はしない
test("CharacterAI.AttackOnDiagonalEdge", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // enemy1 (Player の右下に配置)
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の右に壁を作る
    REGame.map.block(11, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は左折の法則により移動しているはず
    expect(enemy1.x).toBe(10);
    expect(enemy1.y).toBe(11);
});
