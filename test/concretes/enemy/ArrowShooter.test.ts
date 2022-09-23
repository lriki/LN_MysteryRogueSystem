import { assert } from "ts/mr/Common";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LTileShape } from "ts/mr/lively/LBlock";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.ArrowShooter.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_インプ_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UnitTest_投擲必中").id);    // 投擲必中
    REGame.world.transferEntity(enemy1, floorId, 12, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 離れていれば 100% 矢を撃ってくる
    const hp2 = player1.actualParam(MRBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    //----------------------------------------------------------------------------------------------------
    
    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 隣接していても 100% 矢を撃ってくる
    const hp3 = player1.actualParam(MRBasics.params.hp);
    expect(hp3 < hp2).toBe(true);
});

// 視界外のターゲットに向かって、矢が撃たれてないこと
test("concretes.enemies.ArrowShooter.OutOfSight", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 3, 4);
    
    // enemy1 (Player とは別の部屋に配置)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_インプ_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 9, 4);

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

test("concretes.enemies.ArrowShooter.ArrowStack", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_インプ_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 10);

    // Player と Enemy の間に壁を作る
    REGame.map.block(11, 10)._tileShape = LTileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 壁に当たって落ちた arrow のスタック数を確認
    const arrow1 = REGame.map.block(12, 10).getFirstEntity();
    assert(arrow1);
    expect(arrow1._stackCount).toBe(1);
});
