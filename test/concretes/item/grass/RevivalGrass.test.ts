import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REBasics } from "ts/re/data/REBasics";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.RevivalGrass.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const hp1 = player1.actualParam(REBasics.params.hp);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_RevivalGrass_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 11);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2); // 倍速化

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(REBasics.params.hp, 1);

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 倒されるが、復活して HP が回復している。
    // また Enemy は倍速であるが復活した直後はターンは回らず、Scheduler はリセットされる。
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(hp2).toBe(hp1);

    //expect(inventory.entities()[0].dataId() == REData.getEntity("kEntity_雑草_A").id).toBe(true);
});

