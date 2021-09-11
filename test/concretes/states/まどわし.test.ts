import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SView } from "ts/re/system/SView";
import { LFloorId } from "ts/re/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.まどわし", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [stateId], "enemy1"));
    enemy1.dir = 6; // 右へ
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // View には何か別のものを表示させようとする
    const visibility = SView.getEntityVisibility(enemy1);
    expect(visibility.visible).toBe(true);
    expect(visibility.image != undefined).toBe(true);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(!!actor1.states().find(x => x.stateDataId() == stateId)).toBe(true);
        expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(true);

        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // 10 ターンで解除
    expect(!!actor1.states().find(x => x.stateDataId() == stateId)).toBe(false);
    expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(false);
});


test("concretes.states.まどわし.ai", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REData.getStateFuzzy("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 4);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 4);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    {
        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 通路へ向かって逃げている
        expect(enemy1.x).toBe(12);
        expect(enemy1.y).toBe(4);
    }
    
    {
        // Player が通路側に立ちはだかる
        REGame.world._transferEntity(actor1, floorId, 11, 4);
        REGame.world._transferEntity(enemy1, floorId, 10, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 壁側へ向かって逃げている
        expect(enemy1.x).toBe(9);
        expect(enemy1.y).toBe(4);
    }
    
    {
        // - Player が通路側に立ちはだかる
        // - Enemy の後ろが壁
        // - Player と Enemy は隣接していない
        REGame.world._transferEntity(actor1, floorId, 11, 4);
        REGame.world._transferEntity(enemy1, floorId, 9, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // Enemy は移動しない
        expect(enemy1.x).toBe(9);
        expect(enemy1.y).toBe(4);
    }

    {
        // - Player が通路側に立ちはだかる
        // - Enemy の後ろが壁
        // - Player と Enemy は隣接している
        REGame.world._transferEntity(actor1, floorId, 10, 4);
        REGame.world._transferEntity(enemy1, floorId, 9, 4);
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
        // 観念して Player とすれ違うように移動している
        expect(enemy1.x).toBe(10);
    }
});

