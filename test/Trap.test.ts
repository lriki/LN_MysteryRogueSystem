import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LTileShape } from "ts/mr/lively/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Trap.TriggerRate", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地雷A").id, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const trapBehavior = trap1.getEntityBehavior(LTrapBehavior);
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 隠れている状態のカウント

    let triggerd1 = 0;
    for (let i = 0; i < 100; i++) {
        // 右へ移動
        MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        trapBehavior.setExposed(false);
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const hp2 = player1.getActualParam(MRBasics.params.hp);
        if (hp2 < hp1) triggerd1++;
        TestEnv.transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
        player1.setParamCurrentValue(MRBasics.params.hp, hp1);
    }

    //----------------------------------------------------------------------------------------------------
    // 見えている状態のカウント
    trapBehavior.setExposed(true);

    let triggerd2 = 0;
    for (let i = 0; i < 100; i++) {
        // 右へ移動
        MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const hp2 = player1.getActualParam(MRBasics.params.hp);
        if (hp2 < hp1) triggerd2++;
        TestEnv.transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
        player1.setParamCurrentValue(MRBasics.params.hp, hp1);
    }

    // paramHiddenTrapTriggerRate, paramExposedTrapTriggerRate の関係から、振れ幅大きめに基準を作っておく
    expect(1 <= triggerd1 && triggerd1 < 100).toBe(true);  // 100 回全部成功はしないだろう
    expect(triggerd2 < triggerd1).toBe(true);
});

test("Trap.Basic", () => {
    TestEnv.newGame();
    const stateId = TestEnv.StateId_Sleep;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    expect(player1.isStateAffected(stateId)).toBe(true);   // 睡眠状態
});

test("Trap.Enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap));
    trap1._name = "trap1";
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    // TODO: 罠state:必ず発動

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.states().length).toBe(0); // Enemy は罠にはかからないこと
});

test("Trap.Attack", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // trap1
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10); // 罠の上に配置
    const hp1 = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy がダメージを受けていることを確認
    const hp2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    // 敵に効果がある状態では、罠は露出しない
    const behavior1 = trap1.getEntityBehavior(LTrapBehavior);
    expect(behavior1.exposed()).toBe(false);

    //----------------------------------------------------------------------------------------------------

    // Enemy をどける
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10); // 罠の上に配置

    // 右を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 露出している
    const behavior2 = trap1.getEntityBehavior(LTrapBehavior);
    expect(behavior2.exposed()).toBe(true);

    //----------------------------------------------------------------------------------------------------

    //--------------------
    // 壁あり斜め攻撃では露出しない

    // Player の右下に罠を作る
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap2"));
    TestEnv.transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の下に壁を作る
    MRLively.mapView.currentMap.block(10, 11)._tileShape = LTileShape.Wall;

    // 右下を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 3).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 露出しない
    const behavior3 = trap2.getEntityBehavior(LTrapBehavior);
    expect(behavior3.exposed()).toBe(false);
});

