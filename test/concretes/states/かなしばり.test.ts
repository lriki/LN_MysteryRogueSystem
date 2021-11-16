import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REBasics } from "ts/re/data/REBasics";
import { assert } from "ts/re/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 空腹による解除チェック
test("concretes.states.かなしばり.FP", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.setActualParam(REBasics.params.fp, 4);
    actor1.addState(stateId);

    let count = 0;
    while (true) {
        RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

        if (!actor1.states().find(x => x.stateDataId() == stateId)) {
            break;
        }

        count++;
        assert(count < 10); // 不具合でハングしないように
    }
   
    const fp = actor1.actualParam(REBasics.params.fp);
    expect(fp === 3).toBe(true);    // 空腹になっている
    //expect(count > 10).toBe(true);  // 10ターンとかその程度では解除されない
});

// 攻撃による解除チェック
test("concretes.states.かなしばり.Attack", () => {
    TestEnv.newGame();
    const stateId = REData.getState("kState_UTかなしばり").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    const hp1 = actor1.actualParam(REBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 被ダメージにかかわらず、攻撃試行されればステートは解除されている
    const hp2 = actor1.actualParam(REBasics.params.hp);
    expect(!actor1.states().find(x => x.stateDataId() == stateId)).toBe(true);
});
