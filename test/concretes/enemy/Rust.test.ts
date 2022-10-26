import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.Rust", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory2 = player1.getEntityBehavior(LInventoryBehavior);
    
    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory2.addEntity(weapon1);
    const weapon1_UP1 = weapon1.getActualParam(MRBasics.params.upgradeValue);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_青銅の盾_A").id, [], "shield1"));
    inventory2.addEntity(shield1);
    const shield1_UP1 = shield1.getActualParam(MRBasics.params.upgradeValue);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ラストゾンビ_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();
    
    //----------------------------------------------------------------------------------------------------

    // [装備], [待機]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const weapon1_UP2 = weapon1.getActualParam(MRBasics.params.upgradeValue);
    const shield1_UP2 = shield1.getActualParam(MRBasics.params.upgradeValue);

    expect(weapon1_UP2).toBe(weapon1_UP1 - 1);
    expect(shield1_UP2).toBe(shield1_UP1 - 1);
});
