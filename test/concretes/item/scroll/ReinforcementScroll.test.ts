import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SAnumationSequel } from "ts/mr/system/SSequel";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.ReinforcementScroll.Weapon.basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_レインフォーススクロール_A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnUtil(shield1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 武器だけ +1 と解呪
    expect(weapon1.actualParam(MRBasics.params.upgradeValue)).toBe(1);
    expect(shield1.actualParam(MRBasics.params.upgradeValue)).toBe(0);
    expect(weapon1.isStateAffected(stateId)).toBe(false);
    expect(shield1.isStateAffected(stateId)).toBe(true);
    expect(REGame.messageHistory.includesText("効かなかった")).toBe(false);
    expect(REGame.messageHistory.includesText("つよさが 1 増えた")).toBe(true);

    const s = (TestEnv.activeSequelSet.runs()[0].clips()[0].sequels()[0] as SAnumationSequel);
    expect(s.entity().equals(player1)).toBe(true);
    expect(s.anumationlId()).toBe(51);
});

test("concretes.item.scroll.ReinforcementScroll.miss", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_レインフォーススクロール_A").id, [], "item1"));
    inventory.addEntity(item1);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 効果が無ければ Animation は表示されない
    expect((TestEnv.activeSequelSet.runs()[0].clips()[0].sequels()[0] instanceof SAnumationSequel)).toBe(false);
});


test("concretes.item.scroll.ReinforcementScroll.Weapon.Up3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const count = inventory.capacity - 1;
    const items = [];
    for (let i = 0; i < count; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_レインフォーススクロール_A").id, [], "item1"));
        inventory.addEntity(item);
        items.push(item);
    }
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    inventory.addEntity(weapon1);
    equipmentUser.equipOnUtil(weapon1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    let last = weapon1.actualParam(MRBasics.params.upgradeValue);
    let total = 0;
    for (let i = 0; i < count; i++) {
        const item = items[i];

        // [読む]
        RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const v = weapon1.actualParam(MRBasics.params.upgradeValue);
        const d = v - last;
        expect(d == 1 || d == 3).toBe(true);    // +1 または +3 で増加
        total += d;
        last = v;
    }

    // 1回くらいは +3 されるだろう
    expect(total).toBeGreaterThan(count);
});

test("concretes.item.scroll.ReinforcementScroll.Shield.basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_レデューススクロール_A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnUtil(shield1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 防具だけ +1 と解呪
    expect(weapon1.actualParam(MRBasics.params.upgradeValue)).toBe(0);
    expect(shield1.actualParam(MRBasics.params.upgradeValue)).toBe(1);
    expect(weapon1.isStateAffected(stateId)).toBe(true);
    expect(shield1.isStateAffected(stateId)).toBe(false);
    expect(REGame.messageHistory.includesText("効かなかった")).toBe(false);
    expect(REGame.messageHistory.includesText("つよさが 1 増えた")).toBe(true);
});
