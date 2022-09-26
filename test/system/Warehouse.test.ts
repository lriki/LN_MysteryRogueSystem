import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SWarehouseStoreDialog } from "ts/mr/system/dialogs/SWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/mr/system/dialogs/SWarehouseWithdrawDialog";
import { SItemSellDialog } from "ts/mr/system/dialogs/SItemSellDialog";
import { UProperty } from "ts/mr/utility/UProperty";
import { SWarehouseDialogResult } from "ts/mr/system/SCommon";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Warehouse.Store.Basic", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser1 = player1.getEntityBehavior(LEquipmentUserBehavior);

    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "grass1"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒_A").id, [], "weapon1"));
    inventory1.addEntity(grass1);
    inventory1.addEntity(weapon1);
    equipmentUser1.equipOnUtil(weapon1);

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
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
    expect(equipmentUser1.isEquipped(weapon1)).toBeFalsy(); // 装備は外れている

    const items = inventory2.items;
    expect(items.length).toBe(2);
    expect(items[0]).toBe(weapon1);
    expect(items[1]).toBe(grass1);
    expect(dialog.result).toBe(SWarehouseDialogResult.Succeeded);
});

test("system.Warehouse.Store.Fully", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "grass1"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒_A").id, [], "weapon1"));
    inventory1.addEntity(grass1);
    inventory1.addEntity(weapon1);

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    // 容量-1 までアイテムを詰め込む
    for (let i = 0; i < inventory2.capacity - 1; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item"));
        inventory2.addEntity(item);
    }

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

    // あずける
    dialog.storeItems([grass1, weapon1]);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    // アイテムの受け渡しは発生していないこと
    expect(inventory1.itemCount).toBe(2);
    expect(inventory2.itemCount).toBe(inventory2.capacity - 1);
    expect(dialog.result).toBe(SWarehouseDialogResult.FullyCanceled);
});

test("system.Warehouse.Withdraw.Basic", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒_A").id, [], "weapon1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "grass1"));
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
    const items = inventory1.items;
    expect(items.length).toBe(2);
    expect(items[0]).toBe(grass1);
    expect(items[1]).toBe(weapon1);
});

test("system.Warehouse.Withdraw.Fully", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);
    
    // 容量-1 までアイテムを詰め込む
    for (let i = 0; i < inventory2.capacity - 1; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item"));
        inventory1.addEntity(item);
    }

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒_A").id, [], "weapon1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "grass1"));
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

    // とりだす
    dialog.withdrawItems([grass1, weapon1]);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    // アイテムの受け渡しは発生していないこと
    expect(inventory1.itemCount).toBe(inventory1.capacity - 1);
    expect(inventory2.itemCount).toBe(2);
    //expect(dialog.resultItems().length).toBe(0);
});

test("system.Warehouse.Sell", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒_A").id, [], "weapon1"));
    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "grass1"));
    inventory2.addEntity(weapon1);
    inventory2.addEntity(grass1);

    // Dialog を開く
    let submitted = false;
    RESystem.commandContext.openDialog(player1, new SItemSellDialog(warehouse1, player1, warehouse1), false)
    .then((d: SItemSellDialog) => {
        submitted = true;
    });

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const dialog = RESystem.dialogContext.activeDialog();
    assert(dialog instanceof SItemSellDialog);

    dialog.setResultItems([grass1, weapon1]);
    dialog.submitSell();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    expect(inventory2.hasAnyItem()).toBeFalsy();
    expect(weapon1.isDestroyed()).toBeTruthy();
    expect(grass1.isDestroyed()).toBeTruthy();
    expect(inventory1.gold()).toBe(weapon1.data.purchasePrice + grass1.data.purchasePrice);
});

test("system.Warehouse.ChangeCapacity", () => {
    TestEnv.newGame();

    const warehouse1 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A");
    const inventory2 = warehouse1.getEntityBehavior(LInventoryBehavior);

    UProperty.setValue("kEntity_Warehouse_A", "Entity:Inventory.capacity", 100);

    expect(inventory2.capacity).toBe(100);
});
