import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { MRBasics } from "ts/re/data/MRBasics";
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
    player1.addState(MRData.getState("kState_UT罠必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const fp1 = player1.actualParam(MRBasics.params.fp);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_レザーシールド_A").id, [], "shield1"));
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_錆ワナ_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 11, 10);
    const shield1_UP1 = shield1.actualParam(MRBasics.params.upgradeValue);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [装備] → 右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const fp2 = player1.actualParam(MRBasics.params.fp);
    expect(fp2).toBe(fp1 - (paramFPLoss / 2));  // FP が基本値の半分、減少していること

    // 装備はさびない
    const shield1_UP2 = shield1.actualParam(MRBasics.params.upgradeValue);
    expect(shield1_UP2).toBe(shield1_UP1);
});
