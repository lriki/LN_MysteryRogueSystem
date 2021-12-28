import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TileShape } from "ts/re/objects/LBlock";
import { TestUtils } from "test/TestUtils";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.arrow.IronArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kアイアンアロー").id, [], "item1"));
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    TestUtils.testCommonArrow(item1);
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.actualParam(REBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
});

