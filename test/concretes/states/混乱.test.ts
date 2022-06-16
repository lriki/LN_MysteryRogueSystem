import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.混乱.move", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UT混乱").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(true);

        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // 10 ターンで解除
    expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(false);

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(enemy1.mx > 11).toBe(true);
});

test("concretes.states.混乱.attack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_UT混乱").id, REData.getState("kState_UTからぶり").id], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // 周りを移動できない Enemy で囲ってみる
    const enemies = [
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [REData.getState("kState_睡眠").id], "enemy1")),
    ];
    REGame.world.transferEntity(enemies[0], TestEnv.FloorId_FlatMap50x50, 19, 9);
    REGame.world.transferEntity(enemies[1], TestEnv.FloorId_FlatMap50x50, 20, 9);
    REGame.world.transferEntity(enemies[2], TestEnv.FloorId_FlatMap50x50, 21, 9);
    REGame.world.transferEntity(enemies[3], TestEnv.FloorId_FlatMap50x50, 19, 10);
    REGame.world.transferEntity(enemies[4], TestEnv.FloorId_FlatMap50x50, 21, 10);
    REGame.world.transferEntity(enemies[5], TestEnv.FloorId_FlatMap50x50, 19, 11);
    REGame.world.transferEntity(enemies[6], TestEnv.FloorId_FlatMap50x50, 20, 11);
    REGame.world.transferEntity(enemies[7], TestEnv.FloorId_FlatMap50x50, 21, 11);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();
    }

    // 混乱中はランダムに選択された進行方向に何らかのキャラクターがいる場合は攻撃を行う。
    // 周囲8マス全部囲まれているときは毎ターン攻撃が発生することになる。
    expect(TestEnv.integration.skillEmittedCount).toBe(10);
});

test("concretes.states.混乱.movePlayer", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(REData.getState("kState_UT混乱").id);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // 右へ移動しようとする
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(actor1.mx < 20).toBe(true);
});

test("concretes.states.混乱.attackPlayer", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(REData.getState("kState_UT混乱").id);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    let count = 0;
    for (let i = 0; i < 10; i++) {
        // 右に向かって攻撃してみる
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack).withEntityDirection(6));
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();

        if (actor1.dir != 6) count++;
    }

    // 少なくとも1回以上、変な方向に向かって攻撃した
    expect(count > 0).toBe(true);
});

test("concretes.states.混乱.throw", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(REData.getState("kState_UnitTest_投擲必中").id);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);
    const items = [];
    for (let i = 0; i < 5; i++) {
        items[i] = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_キュアリーフ_A").id, [], "enemy1"));
        inventory.addEntity(items[i]);
    }
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 5; i++) {
        // HP1 にする
        enemy1.setActualParam(REBasics.params.hp, 1);

        // 投げる
        RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, items[i]).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();

        // 混乱は投げには影響しないので、命中してHP回復しているはず
        expect(enemy1.actualParam(REBasics.params.hp) > 5).toBe(true);
    }
});
