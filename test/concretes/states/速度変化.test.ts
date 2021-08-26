import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { assert } from "ts/Common";
import { LStateLevelType } from "ts/data/DEffect";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.速度変化", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UT速度バフ").id;

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // デフォルトの行動回数は 1 (等速)
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(1);

    // 倍速化
    actor1.addState(stateId);
    const state = actor1.states().find(x => x.stateDataId() == stateId);
    assert(state);
    expect(state.level()).toBe(1);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(2);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    // 3倍速化
    actor1.addState(stateId);
    expect(state.level()).toBe(2);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(3);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(true);
    
    // 鈍足化
    actor1.addState(stateId, true, -1, LStateLevelType.AbsoluteValue);
    expect(state.level()).toBe(-1);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(-1);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    // 解除
    actor1.removeState(stateId);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(1);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    RESystem.scheduler.stepSimulation();
});

test("concretes.states.速度変化.remove", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UT速度バフ").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(actor1.isStateAffected(stateId)).toBe(true);

        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation();
    }

    // 10 ターンで解除
    const bb = actor1.collectBehaviors();
    expect(actor1.isStateAffected(stateId)).toBe(false);
});
