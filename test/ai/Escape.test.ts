import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SView } from "ts/re/system/SView";
import { LFloorId } from "ts/re/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("ai.Escape.1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REData.getState("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 4);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム屋").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    {
        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 通路へ向かって逃げている
        expect(enemy1.x).toBe(12);
        expect(enemy1.y).toBe(4);
    }
    
    {
        // Player が通路側に立ちはだかる
        REGame.world._transferEntity(actor1, floorId, 11, 4);
        REGame.world._transferEntity(enemy1, floorId, 10, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 壁側へ向かって逃げている
        expect(enemy1.x).toBe(9);
        expect(enemy1.y).toBe(4);
    }
    
    {
        // - Player が通路側に立ちはだかる
        // - Enemy の後ろが壁
        // - Player と Enemy は隣接していない
        REGame.world._transferEntity(actor1, floorId, 11, 4);
        REGame.world._transferEntity(enemy1, floorId, 9, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // Enemy は移動しない
        expect(enemy1.x).toBe(9);
        expect(enemy1.y).toBe(4);
    }

    {
        // - Player が通路側に立ちはだかる
        // - Enemy の後ろが壁
        // - Player と Enemy は隣接している
        REGame.world._transferEntity(actor1, floorId, 10, 4);
        REGame.world._transferEntity(enemy1, floorId, 9, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 観念して Player とすれ違うように移動している
        expect(enemy1.x).toBe(10);
    }
});


test("ai.Escape.2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REData.getState("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 14, 4); // 部屋入り口の通路へ配置
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム屋").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 13, 4);   // 部屋入り口へ配置

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    {
        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 部屋の内側へ向かって逃げる
        expect(enemy1.x).toBe(12);
        expect(enemy1.y).toBe(4);
    }
    
    {
        // Player を部屋の入口へ移動
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 4).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 部屋の内側へ向かって逃げる
        expect(enemy1.x).toBe(11);
        expect(enemy1.y).toBe(4);
    }
});


test("ai.Escape.3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REData.getState("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 11, 4); // 部屋中央へ配置
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム屋").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 13, 4);   // 部屋入り口へ配置

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 通路内へ逃げる
    expect(enemy1.x).toBe(14);
    expect(enemy1.y).toBe(4);
    
    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 部屋の内側へ向かって逃げる
    expect(enemy1.x).toBe(15);
    expect(enemy1.y).toBe(4);
});

