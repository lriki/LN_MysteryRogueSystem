import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LTrapBehavior } from "ts/re/objects/behaviors/LTrapBehavior";
import { REBasics } from "ts/re/data/REBasics";
import { TileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Trap.TriggerRate", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = player1.actualParam(REBasics.params.hp);

    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_地雷").id, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const trapBehavior = trap1.getEntityBehavior(LTrapBehavior);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 隠れている状態のカウント

    let triggerd1 = 0;
    for (let i = 0; i < 100; i++) {
        // 右へ移動
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const hp2 = player1.actualParam(REBasics.params.hp);
        if (hp2 < hp1) triggerd1++;
        REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
        player1.setActualParam(REBasics.params.hp, hp1);
        trapBehavior.setExposed(false);
    }

    //----------------------------------------------------------------------------------------------------
    // 見えている状態のカウント
    trapBehavior.setExposed(true);

    let triggerd2 = 0;
    for (let i = 0; i < 100; i++) {
        // 右へ移動
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const hp2 = player1.actualParam(REBasics.params.hp);
        if (hp2 < hp1) triggerd2++;
        REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
        player1.setActualParam(REBasics.params.hp, hp1);
    }

    // paramHiddenTrapTriggerRate, paramExposedTrapTriggerRate の関係から、振れ幅大きめに基準を作っておく
    expect(50 <= triggerd1 && triggerd1 < 100).toBe(true);  // 100 回全部成功はしないだろう
    expect(triggerd2 < triggerd1).toBe(true);
});

test("Trap.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(REData.getState("kState_UT罠必中").id);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    expect(player1.isStateAffected(TestEnv.StateId_Sleep)).toBe(true);   // 睡眠状態
});

test("Trap.Enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap));
    trap1._name = "trap1";
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    // TODO: 罠state:必ず発動

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.states().length).toBe(0); // Enemy は罠にはかからないこと
});

test("Trap.Attack", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // trap1
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10); // 罠の上に配置
    const hp1 = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy がダメージを受けていることを確認
    const hp2 = enemy1.actualParam(REBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    // 敵に効果がある状態では、罠は露出しない
    const behavior1 = trap1.getEntityBehavior(LTrapBehavior);
    expect(behavior1.exposed()).toBe(false);

    //----------------------------------------------------------------------------------------------------

    // Enemy をどける
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10); // 罠の上に配置

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 露出している
    const behavior2 = trap1.getEntityBehavior(LTrapBehavior);
    expect(behavior2.exposed()).toBe(true);

    //----------------------------------------------------------------------------------------------------

    //--------------------
    // 壁あり斜め攻撃では露出しない

    // Player の右下に罠を作る
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap2"));
    REGame.world._transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の下に壁を作る
    REGame.map.block(10, 11)._tileShape = TileShape.Wall;

    // 右下を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 3).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 露出しない
    const behavior3 = trap2.getEntityBehavior(LTrapBehavior);
    expect(behavior3.exposed()).toBe(false);
});

