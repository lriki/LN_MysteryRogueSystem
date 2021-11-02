import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.SelfExplosion", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ブラストミミックA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy2
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy2"));
    REGame.world._transferEntity(enemy2, TestEnv.FloorId_FlatMap50x50, 12, 10);

    SDebugHelpers.setHP(enemy1, 1); // HP1 にして攻撃が当たったら倒れるようにする
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.isDeathStateAffected()).toBe(false); // Player は生きている
    expect(enemy2.isDestroyed()).toBe(true);            // 爆発によって隣接している敵は即死
});
