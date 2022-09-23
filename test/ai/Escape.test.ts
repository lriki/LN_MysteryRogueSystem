import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("ai.Escape.1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRData.getState("kState_UTまどわし").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 4);
    player1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 11, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 通路へ向かって逃げている
    expect(enemy1.mx).toBe(12);
    expect(enemy1.my).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // Player が通路側に立ちはだかる
    REGame.world.transferEntity(player1, floorId, 11, 4);
    REGame.world.transferEntity(enemy1, floorId, 10, 4);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 壁側へ向かって逃げている
    expect(enemy1.mx).toBe(9);
    expect(enemy1.my).toBe(4);
    
    //----------------------------------------------------------------------------------------------------

    // - Player が通路側に立ちはだかる
    // - Enemy の後ろが壁
    // - Player と Enemy は隣接していない
    REGame.world.transferEntity(player1, floorId, 11, 4);
    REGame.world.transferEntity(enemy1, floorId, 9, 4);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Enemy は移動しない
    expect(enemy1.mx).toBe(9);
    expect(enemy1.my).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // - Player が通路側に立ちはだかる
    // - Enemy の後ろが壁
    // - Player と Enemy は隣接している
    REGame.world.transferEntity(player1, floorId, 10, 4);
    REGame.world.transferEntity(enemy1, floorId, 9, 4);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 観念して Player とすれ違うように移動している
    expect(enemy1.mx).toBe(10);
});


test("ai.Escape.2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRData.getState("kState_UTまどわし").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 14, 4); // 部屋入り口の通路へ配置
    player1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 4);   // 部屋入り口へ配置

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 部屋の内側へ向かって逃げる
    expect(enemy1.mx).toBe(12);
    expect(enemy1.my).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // Player を部屋の入口へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 4).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 部屋の内側へ向かって逃げる
    expect(enemy1.mx).toBe(11);
    expect(enemy1.my).toBe(4);
});


test("ai.Escape.3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRData.getState("kState_UTまどわし").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4); // 部屋中央へ配置
    player1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 4);   // 部屋入り口へ配置

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 通路内へ逃げる
    expect(enemy1.dir).toBe(6);
    expect(enemy1.mx).toBe(14);
    expect(enemy1.my).toBe(4);
    
    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 部屋の内側へ向かって逃げる
    expect(enemy1.dir).toBe(6);
    expect(enemy1.mx).toBe(15);
    expect(enemy1.my).toBe(4);
});


// 倍速1回行動エネミーが、通路へ逃げ込もうとしたが、そこへ移動不可能だったときにクラッシュする問題の修正確認
test("ai.Escape.SpeedLevel2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 4);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_金剛猫_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 12, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 通路方向へ倍速で逃げてほしい
    expect(enemy1.mx).toBe(14);
});

// 倍速1回行動エネミーが、通路へ逃げ込もうとしたが、そこへ移動不可能だったときにクラッシュする問題の修正確認
test("ai.Escape.Issue1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRData.getState("kState_UTかなしばり").id;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4); // 部屋中央へ配置
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_金剛猫_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_金剛猫_A").id, [stateId], "enemy2"));
    REGame.world.transferEntity(enemy1, floorId, 13, 4);   // 部屋入り口
    REGame.world.transferEntity(enemy2, floorId, 14, 4);   // 通路

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // クラッシュせずに終了すればOK
});

// 倍速1回行動エネミーが、通路で他エネミーと向き合い、移動しようとしたときにクラッシュする問題の修正確認
test("ai.Escape.Issue2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    const player1 = TestEnv.setupPlayer(floorId, 7, 13);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_金剛猫_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    REGame.world.transferEntity(enemy1, floorId, 7, 13);
    REGame.world.transferEntity(enemy2, floorId, 8, 13);
    enemy1.dir = 6;
    enemy2.dir = 4;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // クラッシュせずに終了すればOK
});

