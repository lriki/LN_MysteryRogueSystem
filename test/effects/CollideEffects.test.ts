import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { assert } from "ts/mr/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("effects.CollideEffects.Weapon", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ダミードラゴンキラー_A").id, [], "weapon1"));
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ドラゴンキラー_A").id, [], "weapon2"));
    inventory.addEntity(weapon1);
    inventory.addEntity(weapon2);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_Test_サンドバッグドラゴン").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 特攻無しダメージを出してみる

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 何かしらダメージが出ていること
    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    const damage1 = enemy1HP1 - enemy1HP2;
    expect(damage1).toBeGreaterThan(0);

    //----------------------------------------------------------------------------------------------------
    // 特攻有りダメージと比較する

    // // [攻撃]
    // RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    // RESystem.dialogContext.activeDialog().submit();
    
    // RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // const enemy1HP3 = enemy1.actualParam(REBasics.params.hp);

    // const damage1 = enemy1HP1 - enemy1HP2;
    // const damage2 = enemy1HP2 - enemy1HP3;
    // expect(damage1).toBeLessThan(damage2);  // ダメージが必ず増えている

});


test("effects.CollideEffects.Shield", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_皮の盾_A").id, [], "shield1"));
    inventory.addEntity(shield1);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_Test_サンドバッグドラゴン").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const damage = shield1.data.equipment?.parameters[MRBasics.params.def];
    assert(damage);

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 防御力の値と同じダメージが出ていること
    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    const damage1 = enemy1HP1 - enemy1HP2;
    expect(damage1).toBe(damage.value);
});
