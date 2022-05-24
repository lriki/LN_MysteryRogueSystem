import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REBasics } from "ts/re/data/REBasics";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.ArrowShooter", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const hp1 = player1.actualParam(REBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_アローインプA").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_UnitTest_投擲必中").id);    // 投擲必中
    REGame.world._transferEntity(enemy1, floorId, 12, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const a = TestEnv.integration.skillEmittedCount;

    // 離れていれば 100% 矢を撃ってくる
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    //----------------------------------------------------------------------------------------------------
    
    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 隣接していても 100% 矢を撃ってくる
    const hp3 = player1.actualParam(REBasics.params.hp);
    expect(hp3 < hp2).toBe(true);
});

// 視界外のターゲットに向かって、矢が撃たれてないこと
test("concretes.enemies.ArrowShooter.OutOfSight", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 3, 4);
    
    // enemy1 (Player とは別の部屋に配置)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_アローインプA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 9, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    for (let i = 0; i < 5; i++) {
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    // 矢が撃たれ、床に落ちていないこと
    const item1 = REGame.map.block(9, 4).getFirstEntity();
    expect(item1).toBeUndefined();
});
