import { REBasics } from "ts/re/data/REBasics";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.からぶり", () => {

    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    actor1.addState(REData.getStateFuzzy("kState_UTからぶり").id);
    const actorHP1 = actor1.actualParam(REBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UTからぶり").id], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const enemyHP1 = enemy1.actualParam(REBasics.params.hp);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // Player は右を向いて攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // 互いに HP 減少は無い
    expect(actor1.actualParam(REBasics.params.hp)).toBe(actorHP1);
    expect(enemy1.actualParam(REBasics.params.hp)).toBe(enemyHP1);

    // 攻撃自体は互いに行われている
    expect(TestEnv.integration.skillEmittedCount).toBe(20);
});

