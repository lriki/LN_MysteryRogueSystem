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
    const stateId = REData.getState("kState_UTまどわし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    enemy1.dir = 6; // 右へ
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // View には何か別のものを表示させようとする
    const enemy1Visibility1 = SView.getEntityVisibility(enemy1);
    const item1Visibility1 = SView.getEntityVisibility(item1);
    expect(enemy1Visibility1.visible).toBe(true);
    expect(enemy1Visibility1.image).not.toBeUndefined();
    expect(item1Visibility1.visible).toBe(true);
    expect(item1Visibility1.image).not.toBeUndefined();

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

    // 表示が元に戻ること
    const enemy1Visibility2 = SView.getEntityVisibility(enemy1);
    const item1Visibility2 = SView.getEntityVisibility(item1);
    expect(enemy1Visibility2.visible).toBe(true);
    expect(enemy1Visibility2.image).toBeUndefined();
    expect(item1Visibility2.visible).toBe(true);
    expect(item1Visibility2.image).toBeUndefined();
});


