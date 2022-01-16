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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Inventory.Fully", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 持てる数だけアイテムを入れる
    for (let i = 0; i < inventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_キュアリーフ_A").id, [], "item"));
        inventory.addEntity(item);
    }

    // item1 生成&配置
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_キュアリーフ_A").id, [], "item1"));
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();    // 行動確定

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(inventory.contains(item1));  // アイテムは拾えない
});

