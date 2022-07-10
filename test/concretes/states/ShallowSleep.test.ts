import { MRBasics } from "ts/mr/data/MRBasics";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.ShallowSleep.RoomIn", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 16, 4);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(MRBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    let affected = 0;
    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (enemy1.isStateAffected(MRBasics.states.nap)) affected++;

        // 目は覚ましても移動はしていない
        expect(enemy1.mx).toBe(19);
        expect(enemy1.my).toBe(4);
        
        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 16, 4);
        enemy1.addState(stateId);
    }

    // 起きたり起きてなかったり。
    expect(10 < affected && affected < 90).toBe(true);
});

test("concretes.states.ShallowSleep.AdjacentMove", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 17, 4);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(MRBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    let affected = 0;
    for (let i = 0; i < 100; i++) {
        // 移動。enemy1 と隣接する。
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (enemy1.isStateAffected(MRBasics.states.nap)) affected++;
        
        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 17, 4);
        enemy1.addState(stateId);
    }

    // 起きたり起きてなかったり。
    expect(10 < affected && affected < 90).toBe(true);
});

test("concretes.states.ShallowSleep.AwayMove", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 17, 6);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(MRBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    let affected = 0;
    for (let i = 0; i < 100; i++) {
        // 移動。enemy1 と隣接する。
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (enemy1.isStateAffected(MRBasics.states.nap)) affected++;

        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 17, 6);
        enemy1.addState(stateId);
    }

    // 起きない
    expect(affected).toBe(100);
});

test("concretes.states.ShallowSleep.Skill", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 17, 4);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(MRBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    let affected = 0;
    for (let i = 0; i < 100; i++) {
        // 攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (enemy1.isStateAffected(MRBasics.states.nap)) affected++;
        
        // 元に戻す
        enemy1.addState(stateId);
    }

    // 起きたり起きてなかったり。
    expect(10 < affected && affected < 90).toBe(true);
});

// 倍速モンスターの仮眠状態で、トークン消費がうまく回らない問題の修正確認
test("concretes.states.ShallowSleep.Issue1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 15, 4);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ウルフA").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(MRBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    let affected = 0;
    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (enemy1.isStateAffected(MRBasics.states.nap)) affected++;

        // 目は覚ましても移動はしていない
        expect(enemy1.mx).toBe(19);
        expect(enemy1.my).toBe(4);
        
        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 15, 4);
        enemy1.addState(stateId);
    }

    // 起きたり起きてなかったり。
    expect(affected).toBe(100);
});

// 特殊仮眠(攻撃されることでのみ解除) 攻撃による解除チェック
test("concretes.states.ShallowSleep.DamageRemoval", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_仮眠2").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // からぶり攻撃
    player1.addState(MRData.getState("kState_UTからぶり").id);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 実際にダメージを受けていないので、ステートは解除されない
    expect(enemy1.hasState(stateId)).toBeTruthy();
    
    //----------------------------------------------------------------------------------------------------

    // 必中攻撃
    player1.removeAllStates(true);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ダメージを受けたら解除
    expect(enemy1.hasState(stateId)).toBeFalsy();
});


