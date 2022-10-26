import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { UInventory } from "ts/mr/utility/UInventory";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Inventory.Fully", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 持てる数だけアイテムを入れる
    for (let i = 0; i < inventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item"));
        inventory.addEntity(item);
    }

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();    // 行動確定

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(inventory.contains(item1));  // アイテムは拾えない
});


test("system.Inventory.Sort", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_すばやさ草A").id, [], "grass1"));
    const grass2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ちからの草A").id, [], "grass2"));
    const grass3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_しあわせ草A").id, [], "grass3"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_こん棒A").id, [], "weapon1"));
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_青銅の剣A").id, [], "weapon2"));
    const weapon3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_隕石の剣A").id, [], "weapon3"));
    const arrow1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_鉄の矢A").id, [], "arrow1").withStackCount(1));
    const arrow2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_鉄の矢A").id, [], "arrow2").withStackCount(2));

    inventory.addEntity(grass1);
    inventory.addEntity(weapon2);
    inventory.addEntity(grass2);
    inventory.addEntity(weapon1);
    inventory.addEntity(weapon3);
    inventory.addEntity(grass3);
    inventory.addEntity(arrow1);
    inventory.addEntity(arrow2);
    equipmentUser.equipOnUtil(weapon3);

    for (let i = 0; i < 3; i++) {   // 数回ソートして、結果がわからないことを確認する
        UInventory.sort(inventory);
    
        const items = inventory.items;
        expect(items.length).toBe(7);
        expect(items[0]).toBe(weapon3); // 装備しているものは先頭に来る
        expect(items[1]).toBe(weapon1);
        expect(items[2]).toBe(weapon2);
        expect(items[3]).toBe(arrow1);  // Stack 可能なものはまとめられる
        expect(items[4]).toBe(grass1);
        expect(items[5]).toBe(grass2);
        expect(items[6]).toBe(grass3);
        expect(arrow1._stackCount).toBe(3);         // Stack 可能なものはまとめられる
        expect(arrow2.isDestroyed()).toBeTruthy();    // arrow2 は arrow1 へまとめられるため消滅
    }
});
