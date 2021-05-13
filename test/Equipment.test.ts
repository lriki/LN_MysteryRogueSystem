import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LEquipActivity } from "ts/objects/activities/LEquipActivity";
import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LEquipOffActivity } from "ts/objects/activities/LEquipOffActivity";
import { DialogSubmitMode } from "ts/system/SDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('Equipment.EquipOnOff', () => {
    // New Game
    SGameManager.createGameObjects();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);    // 行動確定
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const inventory = actor1.getBehavior(LInventoryBehavior);

    // 武器 入手
    const weapon1 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Weapon1, stateIds: [] });
    inventory.addEntity(weapon1);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity({ prefabId: TestEnv.PrefabId_Shield1, stateIds: [] });
    inventory.addEntity(shield1);

    // [装備]
    dialogContext.postActivity(LEquipActivity.make(actor1, weapon1));
    dialogContext.postActivity(LEquipActivity.make(actor1, shield1));
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
    dialogContext.postActivity(LEquipOffActivity.make(actor1, weapon1));
    dialogContext.postActivity(LEquipOffActivity.make(actor1, shield1));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 外れていること。
    expect(equipmens.isEquipped(weapon1)).toBe(false);
    expect(equipmens.isEquipped(shield1)).toBe(false);
    expect(equipmens.equippedItemEntities().length).toBe(0);
});
