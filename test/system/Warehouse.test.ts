import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { UInventory } from "ts/re/usecases/UInventory";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { SWarehouseStoreDialog } from "ts/re/system/dialogs/SWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Warehouse.Store", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_キュアリーフ_A").id, [], "grass1"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "weapon1"));
    inventory1.addEntity(grass1);
    inventory1.addEntity(weapon1);

    const warehouse1 = REGame.world.getFirstEntityByKey("kActor_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    // Dialog を開く
    let submitted = false;
    RESystem.commandContext.openDialog(player1, new SWarehouseStoreDialog(player1, warehouse1), false)
    .then((d: SWarehouseStoreDialog) => {
        submitted = true;
    });

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const dialog = RESystem.dialogContext.activeDialog();
    assert(dialog instanceof SWarehouseStoreDialog);

    // 草 → 武器の順で2個あずける
    dialog.storeItems([grass1, weapon1]);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    expect(inventory1.hasAnyItem()).toBeFalsy(); // もちものは空になる

    const items = inventory2.entities();
    expect(items.length).toBe(2);
    expect(items[0]).toBe(weapon1);
    expect(items[1]).toBe(grass1);
});

test("system.Warehouse.Withdraw", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const warehouse1 = REGame.world.getFirstEntityByKey("kActor_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "weapon1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_キュアリーフ_A").id, [], "grass1"));
    inventory2.addEntity(weapon1);
    inventory2.addEntity(grass1);

    // Dialog を開く
    let submitted = false;
    RESystem.commandContext.openDialog(player1, new SWarehouseWithdrawDialog(player1, warehouse1), false)
    .then((d: SWarehouseWithdrawDialog) => {
        submitted = true;
    });

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const dialog = RESystem.dialogContext.activeDialog();
    assert(dialog instanceof SWarehouseWithdrawDialog);

    // 草 → 武器の順でとりだす
    dialog.withdrawItems([grass1, weapon1]);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    expect(inventory2.hasAnyItem()).toBeFalsy(); // 倉庫空になる

    // もちものには、ソートはされずに追加されている。
    const items = inventory.entities();
    expect(items.length).toBe(2);
    expect(items[0]).toBe(grass1);
    expect(items[1]).toBe(weapon1);
});
