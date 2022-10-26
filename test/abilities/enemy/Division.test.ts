import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
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
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const atk1 = enemy1.getActualParam(MRBasics.params.atk);

    //----------------------------------------------------------------------------------------------------

    // 右を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    const entityCount1 = MRLively.map.entities().length;

    MRLively.world.random().resetSeed(9);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const eintites = MRLively.map.entities();
    const enemy2 = eintites[eintites.length - 1];

    const atk2 = enemy1.getActualParam(MRBasics.params.atk);
    expect(atk2).toBe(atk1);    // 分裂後にパラメータが増えてしまう問題の修正確認

    expect(enemy1.isDeathStateAffected()).toBeFalsy();  // 倒しちゃってない？
    const entityCount2 = MRLively.map.entities().length;
    expect(entityCount2).toBe(entityCount1 + 1);    // 分裂でエンティティが増えていること
});
