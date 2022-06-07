import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/re/objects/REGame";
import { REBasics } from "ts/re/data/REBasics";
import { SView } from "ts/re/system/SView";
import { SNavigationHelper } from "ts/re/system/SNavigationHelper";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Visibility.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item2 (踏破していない別の部屋)
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_モンスタースクロール_A").id, [], "item2"));
    REGame.world.transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 19, 9);

    // trap2 (踏破していない別の部屋)
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap2"));
    REGame.world.transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 19, 10);

    // enemy2 (踏破していない別の部屋)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);

    expect(SNavigationHelper.testVisibilityForMinimap(player1, enemy1)).toBeFalsy();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(SView.getEntityVisibility(item2).visible).toBeFalsy();
    expect(SView.getEntityVisibility(trap2).visible).toBeFalsy();
    expect(SView.getEntityVisibility(enemy1).visible).toBeFalsy();
});

