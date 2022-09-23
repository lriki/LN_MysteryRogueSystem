import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_苗色スライム_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);   // Player を倒さないように
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const atk1 = enemy1.actualParam(MRBasics.params.atk);

    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    const entityCount1 = REGame.map.entities().length;

    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const eintites = REGame.map.entities();
    const enemy2 = eintites[eintites.length - 1];

    const atk2 = enemy1.actualParam(MRBasics.params.atk);
    expect(atk2).toBe(atk1);    // 分裂後にパラメータが増えてしまう問題の修正確認

    expect(enemy1.isDeathStateAffected()).toBeFalsy();  // 倒しちゃってない？
    const entityCount2 = REGame.map.entities().length;
    expect(entityCount2).toBe(entityCount1 + 1);    // 分裂でエンティティが増えていること
});
