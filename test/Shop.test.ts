import { REGame } from "ts/re/objects/REGame";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { RESystem } from "ts/re/system/RESystem";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REData } from "ts/re/data/REData";
import { LFloorId } from "ts/re/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Shop.Basic", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeByRmmzFixedMapName("Sandbox-店");
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 22, 10);

    const keeper1 = REGame.map.block(19, 6).getFirstEntity();
    const keeper2 = REGame.map.block(19, 12).getFirstEntity();
    assert(keeper1);
    assert(keeper2);

    expect(keeper1.getInnermostFactionId()).toBe(REData.system.factions.neutral);
    expect(keeper1.getOutwardFactionId()).toBe(REData.system.factions.neutral);

    // 商品の陳列を確認
    const getItem = (x: number, y: number) => { const e = REGame.map.block(22, 9).getFirstEntity(); assert(e); return e; };
    const items = [
        getItem(22, 9), getItem(23, 9), getItem(24, 9),
        getItem(22, 10), getItem(23, 10), getItem(24, 10),
        getItem(22, 11), getItem(23, 11), getItem(24, 11),
    ];

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    /*
    //----------------------------------------------------------------------------------------------------

    // しばらく経過させてみても、店主は移動しないこと。
    for (let i = 0; i < 10; i++) {
        // [待機]
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        expect(keeper1.x).toBe(19);
        expect(keeper1.y).toBe(6);
        expect(keeper2.x).toBe(19);
        expect(keeper2.y).toBe(12);
    }

    //----------------------------------------------------------------------------------------------------

    // [拾う]
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 店主は通路をふさぐように移動している
    expect(keeper1.x).toBe(19);
    expect(keeper1.y).toBe(7);
    expect(keeper2.x).toBe(19);
    expect(keeper2.y).toBe(13);

    //----------------------------------------------------------------------------------------------------

    // 店主の隣へ移動
    REGame.world._transferEntity(player1, floorId, 20, 7);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 店主に狙われたりしていないこと
    expect(TestEnv.integration.skillEmittedCount).toBe(0);
    */
});
