import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";
import { DBasics } from "ts/data/DBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Equipment.EquipOnOff", () => {
    // New Game
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const inventory = actor1.getBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    // [装備]
    dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    dialogContext.postActivity(LActivity.makeEquip(actor1, shield1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 装備されていること。
    const equipmens = actor1.getBehavior(LEquipmentUserBehavior);
    expect(equipmens.isEquipped(weapon1)).toBe(true);
    expect(equipmens.isEquipped(shield1)).toBe(true);

    // 装備品はインベントリに含まれていること。また、親オブジェクトはインベントリであること。(装備状態でも Entity が親になることは無い)
    expect(inventory.contains(weapon1)).toBe(true);
    expect(inventory.contains(shield1)).toBe(true);
    expect(weapon1.parentObject()).toBe(inventory);
    expect(shield1.parentObject()).toBe(inventory);
    
    // [はずす]
    dialogContext.postActivity(LActivity.makeEquipOff(actor1, weapon1));
    dialogContext.postActivity(LActivity.makeEquipOff(actor1, shield1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 外れていること。
    expect(equipmens.isEquipped(weapon1)).toBe(false);
    expect(equipmens.isEquipped(shield1)).toBe(false);
    expect(equipmens.equippedItemEntities().length).toBe(0);
});

test("Equipment.Put_Throw", () => {
    TestEnv.newGame();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);
    const equipmens = actor1.getBehavior(LEquipmentUserBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, shield1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // [置く]
    RESystem.dialogContext.postActivity(LActivity.makePut(actor1, weapon1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(equipmens.isEquipped(weapon1)).toBe(false);  // 装備からは外れていること。
    expect(weapon1.isOnGround()).toBe(true);            // アイテムは地面に落ちている。
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, shield1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(equipmens.isEquipped(shield1)).toBe(false);  // 装備からは外れていること。
    expect(shield1.isOnGround()).toBe(true);            // アイテムは地面に落ちている。
});

test("Equipment.Curse", () => {
    TestEnv.newGame();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);
    const equipmens = actor1.getBehavior(LEquipmentUserBehavior);

    // 武器 入手 (呪い付き)
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [REData.getStateFuzzy("UT呪い").id]));
    inventory.addEntity(weapon1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 装備できていること。
    
    // [はずす]
    RESystem.dialogContext.postActivity(LActivity.makeEquipOff(actor1, weapon1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    //const m = REGame.messageHistory;
    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 外れないこと。
    
    // [置く]
    RESystem.dialogContext.postActivity(LActivity.makePut(actor1, weapon1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 外れないこと。
    expect(weapon1.isOnGround()).toBe(false);           // 地面に置かれたりしていないこと。


});

test("Equipment.UpgradeValue", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kゴブリンのこん棒").id, [], "item1"));

    // 修正値+2
    item1.setActualParam(DBasics.params.upgradeValue, 2);

    // 識別前は表示名に +2 が含まれない
    const name1 = REGame.identifyer.makeDisplayText(item1);
    expect(name1.includes("+2")).toBe(false);

    // 識別してみる
    item1.setIndividualIdentified(true);

    // 識別後は +2 が含まれる
    const name2 = REGame.identifyer.makeDisplayText(item1);
    expect(name2.includes("+2")).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
});

