import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REBasics } from "ts/re/data/REBasics";
import { UName } from "ts/re/usecases/UName";
import { TestEnv } from "test/TestEnv";
import { paramFPLoss } from "ts/re/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.shield.LeatherShield.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(REData.getState("kState_UT罠必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const fp1 = player1.actualParam(REBasics.params.fp);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kレザーシールド").id, [], "shield1"));
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_錆ワナ").id, [], "trap1"));
    REGame.world._transferEntity(trap1, floorId, 11, 10);
    const shield1_UP1 = shield1.actualParam(REBasics.params.upgradeValue);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [装備] → 右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const fp2 = player1.actualParam(REBasics.params.fp);
    expect(fp2).toBe(fp1 - (paramFPLoss / 2));  // FP が基本値の半分、減少していること

    // 装備はさびない
    const shield1_UP2 = shield1.actualParam(REBasics.params.upgradeValue);
    expect(shield1_UP2).toBe(shield1_UP1);
});
