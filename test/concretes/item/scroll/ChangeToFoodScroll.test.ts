import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { REGame } from "ts/mr/objects/REGame";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ChangeToFoodScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const items = inventory.items;
    expect(items.length).toBe(1);
    expect(items[0].data.entity.key).toBe("kEntity_フランスパン_A");
    expect(item2.isDestroyed()).toBeFalsy();    // Entity が変異しただけなので、インスタンス自体は削除されていない
    expect(REGame.messageHistory.includesText("変化した")).toBeTruthy();
});

test("concretes.item.scroll.EquipmentIssuse", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item2"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "weapon1"));
    const arrow1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id, [], "arrow1"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    inventory.addEntity(weapon1);
    inventory.addEntity(arrow1);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnShortcut(RESystem.commandContext, arrow1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 装備中の武器に対して [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [weapon1]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(equipmentUser.isEquipped(weapon1)).toBeFalsy();

    //----------------------------------------------------------------------------------------------------

    // 装備中の矢(ショートカット)に対して [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item2, [arrow1]).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    expect(equipmentUser.shortcutItem).toBeUndefined();
});

