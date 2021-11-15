
import { TestEnv } from "./TestEnv";
import "./Extension";
import "./../ts/re/objects/Extensions";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Recorder.Basic1", /*async*/ () => {
    
// TODO: いったん断念。
// やっぱり JsonEx 使って Object クラスをまとめて復元できるようにしないと困難。
/*
    TestEnv.newGame();
    REGame.recorder.setSavefileId(999);

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // 配置
    TestEnv.performFloorTransfer();
    await REGame.recorder.startRecording();

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);  // 配置
    const initialHP1 = enemy1.actualParam(DBasics.params.hp);

    // 初期状態を Save
    //const savedata1 = SGameManager.makeSaveContents();

    {
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        // 右へ移動
        RESystem.dialogContext.postActivity(LActivity.makeDirectionChange(actor1, 6));
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
        // 右へ攻撃
        UAction.postPerformSkill(RESystem.dialogContext.commandContext(), actor1, RESystem.skills.normalAttack);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    }

    await REGame.recorder.stopRecording();

    const resultHP2 = enemy1.actualParam(DBasics.params.hp);

    // 初期状態を Load
    //SGameManager.extractSaveContents(savedata1);
    // ※Jest で JsonEx が使えないので手動で戻す
    {
        REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // 配置
        REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);  // 配置
        enemy1.setActualParam(DBasics.params.hp, initialHP1);
    }

    const actor1_2 = REGame.world.entity(actor1.entityId());
    const enemy1_2 = REGame.world.entity(enemy1.entityId());

    REGame.recorder.startPlayback();

    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------


    const resultHP3 = enemy1_2.actualParam(DBasics.params.hp);

    expect(resultHP2).toBe(resultHP3);
*/
});

