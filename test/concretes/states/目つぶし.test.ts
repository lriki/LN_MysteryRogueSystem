import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SView } from "ts/re/system/SView";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.目つぶし", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UT目つぶし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [stateId], "enemy1"));
    enemy1.dir = 6; // 右へ
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    expect(SView.getLookNames(actor1, enemy1).name != enemy1.getDisplayName().name).toBe(true);
    expect(SView.getTilemapView().visible).toBe(false);
    expect(SView.getEntityVisibility(enemy1).visible).toBe(false);

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

    // Player に隣接していても攻撃せず、まっすぐ進む
    expect(enemy1.x == 20).toBe(true);
});
