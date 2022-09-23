import { MRBasics } from "ts/mr/data/MRBasics";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.からぶり", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    actor1.addState(MRData.getState("kState_UTからぶり").id);
    const actorHP1 = actor1.actualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [MRData.getState("kState_UTからぶり").id], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const enemyHP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 10 ターン分 シミュレーション実行
    for (let i = 0; i < 10; i++) {
        // Player は右を向いて攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, MRData.system.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // 互いに HP 減少は無い
        const actorHP2 = actor1.actualParam(MRBasics.params.hp);
        const enemyHP2 = enemy1.actualParam(MRBasics.params.hp);
        expect(actorHP2).toBe(actorHP1);
        expect(enemyHP2).toBe(enemyHP1);
    }

    // 攻撃自体は互いに行われている
    expect(TestEnv.integration.skillEmittedCount).toBe(20);

    const message = REGame.messageHistory;
    expect(message.countIncludesText("ミス")).toBe(20);
    expect(message.includesText("効かなかった")).toBeFalsy();
});

