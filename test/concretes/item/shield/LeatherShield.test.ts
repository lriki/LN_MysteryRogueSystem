import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { TestEnv } from "test/TestEnv";
import { paramFPLoss } from "ts/mr/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.shield.LeatherShield.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const fp1 = player1.getActualParam(MRBasics.params.fp);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_皮の盾A").id, [], "shield1"));
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_錆ワナA").id, [], "trap1"));
    MRLively.world.transferEntity(trap1, floorId, 11, 10);
    const shield1_UP1 = shield1.getActualParam(MRBasics.params.upgradeValue);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [装備] → 右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const fp2 = player1.getActualParam(MRBasics.params.fp);
    expect(fp2).toBe(fp1 - (paramFPLoss / 2));  // FP が基本値の半分、減少していること

    // 装備はさびない
    const shield1_UP2 = shield1.getActualParam(MRBasics.params.upgradeValue);
    expect(shield1_UP2).toBe(shield1_UP1);
});
