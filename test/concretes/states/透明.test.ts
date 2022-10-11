import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SView } from "ts/mr/system/SView";
import { LActionTokenType } from "ts/mr/lively/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.透明.Player", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 11, 3);
    actor1.addState(stateId);

    expect(SView.getEntityVisibility(actor1).visible).toBe(true);
    expect(SView.getEntityVisibility(actor1).translucent).toBe(true);
});

test("concretes.states.透明.EnemyMove", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    // Minimap には表示されない
    expect(SView.getEntityVisibility(enemy1).visible).toBe(false);

    // 10 ターン分 シミュレーション実行
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(enemy1.mx > 11).toBe(true);
});


test("concretes.states.透明.Enemy", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UT透明").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 11, 3);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 11, 6);


    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Player 透明化
    actor1.addState(stateId);

    // 足踏み
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // enemy1 は Player を視認できなくなったので通路へ向かって移動している
    expect(enemy1.mx).toBe(12);
    expect(enemy1.my).toBe(5);
});
