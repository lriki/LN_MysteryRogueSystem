import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SView } from "ts/mr/system/SView";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.目つぶし", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UT目つぶし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [stateId], "enemy1"));
    enemy1.dir = 6; // 右へ
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    expect(SView.getLookNames(actor1, enemy1).name != enemy1.getDisplayName().name).toBe(true);
    expect(SView.getTilemapView().visible).toBe(false);
    expect(SView.getEntityVisibility(enemy1).visible).toBe(false);

    // 10 ターン分 シミュレーション実行
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(!!actor1.states.find(x => x.stateDataId() == stateId)).toBe(true);
        expect(!!enemy1.states.find(x => x.stateDataId() == stateId)).toBe(true);

        // 待機
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // 10 ターンで解除
    expect(!!actor1.states.find(x => x.stateDataId() == stateId)).toBe(false);
    expect(!!enemy1.states.find(x => x.stateDataId() == stateId)).toBe(false);

    // Player に隣接していても攻撃せず、まっすぐ進む
    expect(enemy1.mx == 20).toBe(true);
});
