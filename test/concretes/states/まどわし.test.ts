import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SView } from "ts/mr/system/SView";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.まどわし", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [stateId], "enemy1"));
    enemy1.dir = 6; // 右へ
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // View には何か別のものを表示させようとする
    const enemy1Visibility1 = SView.getEntityVisibility(enemy1);
    const item1Visibility1 = SView.getEntityVisibility(item1);
    expect(enemy1Visibility1.visible).toBe(true);
    expect(enemy1Visibility1.image).not.toBeUndefined();
    expect(item1Visibility1.visible).toBe(true);
    expect(item1Visibility1.image).not.toBeUndefined();

    // 10 ターン分 シミュレーション実行
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(!!actor1.states().find(x => x.stateDataId() == stateId)).toBe(true);
        expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(true);

        // 待機
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    }

    // 10 ターンで解除
    expect(!!actor1.states().find(x => x.stateDataId() == stateId)).toBe(false);
    expect(!!enemy1.states().find(x => x.stateDataId() == stateId)).toBe(false);

    // 表示が元に戻ること
    const enemy1Visibility2 = SView.getEntityVisibility(enemy1);
    const item1Visibility2 = SView.getEntityVisibility(item1);
    expect(enemy1Visibility2.visible).toBe(true);
    expect(enemy1Visibility2.image).toBeUndefined();
    expect(item1Visibility2.visible).toBe(true);
    expect(item1Visibility2.image).toBeUndefined();
});


