import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.states.混乱.move", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UT混乱").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

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
    expect(enemy1.x > 11).toBe(true);
});

test("concretes.states.混乱.attack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT混乱").id, REData.getStateFuzzy("kState_UTからぶり").id], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // 周りを移動できない Enemy で囲ってみる
    const enemies = [
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
        SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT睡眠").id], "enemy1")),
    ];
    REGame.world._transferEntity(enemies[0], TestEnv.FloorId_FlatMap50x50, 19, 9);
    REGame.world._transferEntity(enemies[1], TestEnv.FloorId_FlatMap50x50, 20, 9);
    REGame.world._transferEntity(enemies[2], TestEnv.FloorId_FlatMap50x50, 21, 9);
    REGame.world._transferEntity(enemies[3], TestEnv.FloorId_FlatMap50x50, 19, 10);
    REGame.world._transferEntity(enemies[4], TestEnv.FloorId_FlatMap50x50, 21, 10);
    REGame.world._transferEntity(enemies[5], TestEnv.FloorId_FlatMap50x50, 19, 11);
    REGame.world._transferEntity(enemies[6], TestEnv.FloorId_FlatMap50x50, 20, 11);
    REGame.world._transferEntity(enemies[7], TestEnv.FloorId_FlatMap50x50, 21, 11);

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
    actor1.addState(REData.getStateFuzzy("kState_UT混乱").id);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // 右へ移動しようとする
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(actor1.x < 20).toBe(true);
});

test("concretes.states.混乱.attackPlayer", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(REData.getStateFuzzy("kState_UT混乱").id);

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
    const inventory = actor1.getBehavior(LInventoryBehavior);
    const items = [];
    for (let i = 0; i < 5; i++) {
        items[i] = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kキュアリーフ").id, [], "enemy1"));
        inventory.addEntity(items[i]);
    }
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 5; i++) {
        // HP1 にする
        enemy1.setActualParam(DBasics.params.hp, 1);

        // 投げる
        RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, items[i]).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();

        // 混乱は投げには影響しないので、命中してHP回復しているはず
        expect(enemy1.actualParam(DBasics.params.hp) > 5).toBe(true);
    }
});
