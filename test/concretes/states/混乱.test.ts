import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.states.混乱", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UT混乱").id], "enemy1"));
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

    const message = REGame.message;

    // 近づいてくることはまずないはず
    expect(enemy1.x > 11).toBe(true);
});

