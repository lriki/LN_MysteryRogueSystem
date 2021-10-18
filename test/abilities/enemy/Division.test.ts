import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { LEntityDivisionBehavior } from "ts/re/objects/abilities/LEntityDivisionBehavior";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Abilities.Enemy.Division", () => {
    TestEnv.newGame();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    enemy1.addBehavior(LEntityDivisionBehavior);
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const a = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    const entityCount = REGame.map.entities().length;

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 分裂でエンティティが増えていること
    expect(enemy1.isDeathStateAffected()).toBe(false);  // 倒しちゃってない？
    expect(REGame.map.entities().length).toBe(entityCount + 1);
});
