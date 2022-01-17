import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REBasics } from "ts/re/data/REBasics";
import { UName } from "ts/re/usecases/UName";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Equipment.EquipOnOff", () => {
    TestEnv.newGame();

    // player1 配置
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10); 

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動\
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // 装備されていること。
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);
    expect(equipmens.isEquipped(weapon1)).toBe(true);
    expect(equipmens.isEquipped(shield1)).toBe(true);

    // 装備品はインベントリに含まれていること。また、親オブジェクトはインベントリであること。(装備状態でも Entity が親になることは無い)
    expect(inventory.contains(weapon1)).toBe(true);
    expect(inventory.contains(shield1)).toBe(true);
    expect(weapon1.parentObject()).toBe(inventory);
    expect(shield1.parentObject()).toBe(inventory);
    
    //----------------------------------------------------------------------------------------------------

    // [はずす]
    RESystem.dialogContext.postActivity(LActivity.makeEquipOff(player1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquipOff(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // 外れていること。
    expect(equipmens.isEquipped(weapon1)).toBe(false);
    expect(equipmens.isEquipped(shield1)).toBe(false);
    expect(equipmens.equippedItemEntities().length).toBe(0);
});

test("Equipment.Put_Throw", () => {
    TestEnv.newGame();

    // player1
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(shield1);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // [置く]
    RESystem.dialogContext.postActivity(LActivity.makePut(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(weapon1)).toBe(false);  // 装備からは外れていること。
    expect(weapon1.isOnGround()).toBe(true);            // アイテムは地面に落ちている。

    //----------------------------------------------------------------------------------------------------

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(shield1)).toBe(false);  // 装備からは外れていること。
    expect(shield1.isOnGround()).toBe(true);            // アイテムは地面に落ちている。
});

test("Equipment.Curse", () => {
    TestEnv.newGame();

    // player1
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);

    // 武器 入手 (呪い無し)
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, []));
    inventory.addEntity(weapon2);

    // 武器 入手 (呪い付き)
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [REData.getState("kState_System_Curse").id]));
    REGame.world._transferEntity(weapon1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [拾う]
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(inventory.contains(weapon1)).toBe(true);   // アイテムを拾えていること
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 装備できていること。

    //----------------------------------------------------------------------------------------------------

    // 呪われていない武器を [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 呪われた武器は外せない
    expect(equipmens.isEquipped(weapon2)).toBe(false);
    
    //----------------------------------------------------------------------------------------------------

    // [はずす]
    RESystem.dialogContext.postActivity(LActivity.makeEquipOff(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 外れないこと。
    
    //----------------------------------------------------------------------------------------------------

    // [置く]
    RESystem.dialogContext.postActivity(LActivity.makePut(player1, weapon1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    expect(equipmens.isEquipped(weapon1)).toBe(true);   // 外れないこと。
    expect(weapon1.isOnGround()).toBe(false);           // 地面に置かれたりしていないこと。
});

test("Equipment.UpgradeValue", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 装備 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const atk1 = player1.actualParam(REBasics.params.atk);
    const def1 = player1.actualParam(REBasics.params.def);
    
    //----------------------------------------------------------------------------------------------------

    // 武器修正値+1
    weapon1.setActualParam(REBasics.params.upgradeValue, 1);

    const atk2 = player1.actualParam(REBasics.params.atk);
    const def2 = player1.actualParam(REBasics.params.def);

    expect(atk2 > atk1).toBe(true);
    expect(def2 == def1).toBe(true);    // def には影響していないはず

    // 盾修正値+1
    shield1.setActualParam(REBasics.params.upgradeValue, 1);

    const atk3 = player1.actualParam(REBasics.params.atk);
    const def3 = player1.actualParam(REBasics.params.def);

    expect(atk3 == atk2).toBe(true);    // atk には影響していないはず
    expect(def3 > def2).toBe(true); 
});

test("Equipment.IdentifyUpgradeValue", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "item1"));

    // 修正値+2
    item1.setActualParam(REBasics.params.upgradeValue, 2);

    // 識別前は表示名に +2 が含まれない
    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes("+2")).toBe(false);

    // 識別してみる
    item1.setIndividualIdentified(true);

    // 識別後は +2 が含まれる
    const name2 = UName.makeNameAsItem(item1);
    expect(name2.includes("+2")).toBe(true);

    RESystem.scheduler.stepSimulation();
});

