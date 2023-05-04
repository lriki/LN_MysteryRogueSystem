import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.activity.Shortcut", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1"));
    item1._stackCount = 3;
    inventory.addEntity(item1);

    // [セット]
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    equipmentUser.equipOnShortcut(MRSystem.commandContext, item1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [使う] (ショートカット)
    const activity1 = LActivity.makePrimaryUse(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(item1._stackCount).toBe(2);      // スタックが減っている

    //----------------------------------------------------------------------------------------------------

    // [置く]
    MRSystem.dialogContext.postActivity(LActivity.makePut(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // インベントリから外れたことで、ショートカットから外れている。
    expect(equipmentUser.isShortcutEquipped(item1)).toBeFalsy();
});
