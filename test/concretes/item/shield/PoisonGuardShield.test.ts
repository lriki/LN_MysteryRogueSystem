import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.shield.PoisonGuardShield", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const pow1 = player1.actualParam(MRBasics.params.pow);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_うろこの盾_A").id, [], "shield1"));
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒草_B").id, [], "item1"));
    inventory.addEntity(shield1);
    inventory.addEntity(item1);
    equipmentUser.equipOnUtil(shield1);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒矢の罠_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const pow2 = player1.actualParam(MRBasics.params.pow);
    expect(pow2).toBeLessThan(pow1);        // 毒矢の効果は受けてしまう

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const pow4 = player1.actualParam(MRBasics.params.pow);
    expect(pow4).toBeLessThan(pow1);        // 毒草の効果は受けてしまう
});

test("concretes.item.shield.PoisonGuardShield2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const pow1 = player1.actualParam(MRBasics.params.pow);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_うろこの盾_A").id, [], "shield1"));
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(shield1);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビ_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_Anger").id);
    REGame.world.transferEntity(enemy1, floorId, 12, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const pow5 = player1.actualParam(MRBasics.params.pow);
    expect(pow5).toBe(pow1);                // 特定スキルからの効果は受けない
});

