import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { LEntityDivisionBehavior } from "ts/mr/objects/abilities/LEntityDivisionBehavior";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Abilities.Enemy.Division", () => {
    TestEnv.newGame();

    // actor1
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_スピリットスライムA").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);   // Player を倒さないように
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    const entityCount1 = REGame.map.entities().length;

    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(enemy1.isDeathStateAffected()).toBeFalsy();  // 倒しちゃってない？
    const entityCount2 = REGame.map.entities().length;
    expect(entityCount2).toBe(entityCount1 + 1);    // 分裂でエンティティが増えていること
});
