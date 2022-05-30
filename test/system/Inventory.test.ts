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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Inventory.Fully", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 持てる数だけアイテムを入れる
    for (let i = 0; i < inventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_キュアリーフ_A").id, [], "item"));
        inventory.addEntity(item);
    }

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    REGame.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(inventory.contains(item1));  // アイテムは拾えない
});


test("system.Inventory.Sort", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    const grass1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スピードドラッグ_A").id, [], "grass1"));
    const grass2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_パワードラッグ_A").id, [], "grass2"));
    const grass3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_グロースドラッグ_A").id, [], "grass3"));
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "weapon1"));
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ゴールドソード_A").id, [], "weapon2"));
    const weapon3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_セイクリッドセイバー_A").id, [], "weapon3"));
    const arrow1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_アイアンアロー_A").id, [], "arrow1"));
    const arrow2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_アイアンアロー_A").id, [], "arrow2"));

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
        expect(arrow1._stackCount).toBeGreaterThan(4); // Stack 可能なものはまとめられる
    }
});
