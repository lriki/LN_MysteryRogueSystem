import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { assert } from "ts/re/Common";
import { TileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// HP を一気に削り切ったときのテスト
test("concretes.enemy.SelfExplosion.NotExplosion", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ブラストミミックA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    SDebugHelpers.setHP(enemy1, 1); // HP1 にして攻撃が当たったら倒れるようにする
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------


    const player1HP1 = player1.idealParam(REBasics.params.hp);
    const player1HP2 = player1.actualParam(REBasics.params.hp);
    expect(player1.isDeathStateAffected()).toBe(false); // Player は生きている
    expect(player1HP2).toBe(player1HP1);                // 爆発していないので、ダメージは受けていない
    expect(enemy1.isDestroyed()).toBeTruthy();          // Enemy は倒れている
});

test("concretes.enemy.SelfExplosion.Explosion", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const player1HP1 = player1.actualParam(REBasics.params.hp);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ふきとばしの杖_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ブラストミミックA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const enemy1HP1 = enemy1.actualParam(REBasics.params.hp);
    assert(enemy1HP1 > 10);     // テスト用に、最低これだけは確保しておく
    SDebugHelpers.setHP(enemy1, 10); // 爆発する一歩手前にしておく

    // enemy2
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    REGame.world._transferEntity(enemy2, TestEnv.FloorId_FlatMap50x50, 11, 11);
    
    // ふきとばし効果でダメージを与えたいので、Enemy1 の後ろに壁を作る
    REGame.map.block(12, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [振る]
    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(enemy1.x).toBe(11);  // 一応、爆発位置を確認

    const player1HP2 = player1.actualParam(REBasics.params.hp);
    expect(player1.isDeathStateAffected()).toBe(false); // Player は生きている
    expect(player1HP2).toBe(2);                         // Player は爆発のダメージ受けている。HP1 になる -> 自動回復するので 2 となる。
    expect(enemy1.isDeathStateAffected()).toBe(false);  // Enemy1 は爆発で消滅している
    expect(enemy2.isDestroyed()).toBe(true);            // 爆発によって隣接している敵は即死
});
