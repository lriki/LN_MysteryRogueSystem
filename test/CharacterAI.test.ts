import { TestEnv } from "./TestEnv";
import { DBasics } from "ts/data/DBasics";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { DialogSubmitMode } from "ts/system/SDialog";
import { SGameManager } from "ts/system/SGameManager";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { DEntityInstance } from "ts/data/DEntity";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/system/SEffectContext";
import { TileShape } from "ts/objects/LBlock";
import { REData } from "ts/data/REData";
import { LActivity } from "ts/objects/activities/LActivity";
import { LActorBehavior } from "ts/objects/behaviors/LActorBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("CharacterAI.Moving1", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_CharacterAI, 19, 4);
    TestEnv.performFloorTransfer();

    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 13, 5);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は入り口に向かって↑に移動している
    expect(enemy1.x).toBe(13);
    expect(enemy1.y).toBe(4);

    // 足踏み
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は通路に向かって→に移動している
    expect(enemy1.x).toBe(14);
    expect(enemy1.y).toBe(4);
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


test("CharacterAI.ActionPattern", () => {
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_CharacterAI, 2, 4);
    TestEnv.performFloorTransfer();
    const initialHP = actor1.getBehavior(LActorBehavior).actualParam(DBasics.params.hp);

    // enemy1 
    const enemy1 = SEntityFactory.newEntity({ prefabId: REData.getPrefab("pドラゴン").id, stateIds: [] });
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 4, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    REGame.world.random().resetSeed(4);     // 炎を吐く乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    const hp = actor1.getBehavior(LActorBehavior).actualParam(DBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

