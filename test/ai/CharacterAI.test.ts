import { TestEnv } from "../TestEnv";
import { REBasics } from "ts/re/data/REBasics";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TileShape } from "ts/re/objects/LBlock";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("ai.CharacterAI.Moving1", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 19, 4);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 13, 5);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は入り口に向かって↑に移動している
    expect(enemy1.x).toBe(13);
    expect(enemy1.y).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は通路に向かって→に移動している
    expect(enemy1.x).toBe(14);
    expect(enemy1.y).toBe(4);
});

// 壁角斜め方向への攻撃はしない
test("ai.CharacterAI.AttackOnDiagonalEdge", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // enemy1 (Player の右下に配置)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の右に壁を作る
    REGame.map.block(11, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    const dialogContext = RESystem.dialogContext;
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は左折の法則により移動しているはず
    expect(enemy1.x).toBe(10);
    expect(enemy1.y).toBe(11);
});

test("ai.CharacterAI.ActionPattern", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 2, 4);
    const initialHP = player1.actualParam(REBasics.params.hp);

    // enemy1 
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ドラゴンA").id));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 4, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    const dialogContext = RESystem.dialogContext;
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(4);     // 炎を吐く乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp = player1.actualParam(REBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

// 通路での移動中、(-1,-1)の方向を向いてしまう問題の修正確認
test("ai.CharacterAI.issue1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 3, 13);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 13);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 5; i++) {
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
        
        expect(enemy1.x).toBe(11 - (i + 1));
        expect(enemy1.dir).toBe(4);
    }
});

// x2 速, 1回攻撃 のモンスターが通路で他のモンスターとかち合うと落ちる問題の修正確認
test("ai.CharacterAI.Issue2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 15, 4);
    enemy1.dir = 4;

    // enemy2 (x2 速, 1回攻撃)
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ウルフA").id, [], "enemy2"));
    REGame.world._transferEntity(enemy2, floorId, 14, 4);
    enemy2.dir = 6;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
});

// 通路移動中、向きが変更されない問題の修正確認
test("ai.CharacterAI.Issue3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 20, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 26, 14);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const step = (x: number, y: number) => {
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
        expect(enemy1.x).toBe(x);
        expect(enemy1.y).toBe(y);
    };

    step(25, 14);
    step(24, 14);
    step(23, 14);
    step(23, 13);
    step(23, 12);
    step(22, 12);
    step(21, 12);
});

// RatedRandomAI が、他 Unit の方へ移動が発生したときに assert が発生する問題の修正確認
test("ai.CharacterAI.Issue_NS#10", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 20, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_バットA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 26, 14);

    const info = DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_仮眠2").id], "enemy1");
    const enemy2 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy2, floorId, 25, 13);
    const enemy3 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy3, floorId, 26, 13);
    const enemy4 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy4, floorId, 27, 13);

    const enemy5 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy5, floorId, 25, 14);
    const enemy6 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy6, floorId, 27, 14);

    const enemy7 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy7, floorId, 25, 15);
    const enemy8 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy8, floorId, 26, 15);
    const enemy9 = SEntityFactory.newEntity(info);
    REGame.world._transferEntity(enemy9, floorId, 27, 15);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const step = () => {
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
        expect(enemy1.x).toBe(26);
        expect(enemy1.y).toBe(14);
    };

    step();
    step();
    step();
    step();
    step();
    step();
    step();
});
