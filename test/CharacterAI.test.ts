import { TestEnv } from "./TestEnv";
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

afterAll(() => {
});

test("CharacterAI.Moving1", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_CharacterAI, 19, 4);
    TestEnv.performFloorTransfer();

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 13, 5);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は入り口に向かって↑に移動している
    expect(enemy1.x).toBe(13);
    expect(enemy1.y).toBe(4);

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は通路に向かって→に移動している
    expect(enemy1.x).toBe(14);
    expect(enemy1.y).toBe(4);
});

// 壁角斜め方向への攻撃はしない
test("CharacterAI.AttackOnDiagonalEdge", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // enemy1 (Player の右下に配置)
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の右に壁を作る
    REGame.map.block(11, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // enemy1 は左折の法則により移動しているはず
    expect(enemy1.x).toBe(10);
    expect(enemy1.y).toBe(11);
});


test("CharacterAI.ActionPattern", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_CharacterAI, 2, 4);
    TestEnv.performFloorTransfer();
    const initialHP = actor1.actualParam(REBasics.params.hp);

    // enemy1 
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ドラゴンA").id));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 4, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(4);     // 炎を吐く乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    const hp = actor1.actualParam(REBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

