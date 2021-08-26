import { DBasics } from "ts/data/DBasics";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { assert } from "ts/Common";
import { LStateLevelType } from "ts/objects/LEntity";

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

    RESystem.scheduler.stepSimulation();



    /*
    const actorHP1 = actor1.actualParam(DBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UTからぶり").id], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const enemyHP1 = enemy1.actualParam(DBasics.params.hp);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // Player は右を向いて攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // 互いに HP 減少は無い
    expect(actor1.actualParam(DBasics.params.hp)).toBe(actorHP1);
    expect(enemy1.actualParam(DBasics.params.hp)).toBe(enemyHP1);

    // 攻撃自体は互いに行われている
    expect(TestEnv.integration.skillEmittedCount).toBe(20);
    */
});

