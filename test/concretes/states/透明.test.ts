import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SView } from "ts/re/system/SView";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.透明.Player", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 11, 3);
    actor1.addState(stateId);

    expect(SView.getEntityVisibility(actor1).visible).toBe(true);
    expect(SView.getEntityVisibility(actor1).translucent).toBe(true);
});

test("concretes.states.透明.EnemyMove", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム屋").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // Minimap には表示されない
    expect(SView.getEntityVisibility(enemy1).visible).toBe(false);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction(LActionTokenType.Major));
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(enemy1.x > 11).toBe(true);
});


test("concretes.states.透明.Enemy", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 11, 3);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム屋").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 11, 6);


    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Player 透明化
    actor1.addState(stateId);

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // enemy1 は Player を視認できなくなったので通路へ向かって移動している
    expect(enemy1.x).toBe(12);
    expect(enemy1.y).toBe(5);
});
