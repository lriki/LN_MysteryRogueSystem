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
    const actor1 = TestEnv.setupPlayer(floorId, 22, 10);

    const keeper1 = REGame.map.block(19, 6).getFirstEntity();
    const keeper2 = REGame.map.block(19, 12).getFirstEntity();
    assert(keeper1);
    assert(keeper2);

    const getItem = (x: number, y: number) => { const e = REGame.map.block(22, 9).getFirstEntity(); assert(e); return e; };

    const items = [
        getItem(22, 9), getItem(23, 9), getItem(24, 9),
        getItem(22, 10), getItem(23, 10), getItem(24, 10),
        getItem(22, 11), getItem(23, 11), getItem(24, 11),
    ];

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // しばらく経過させてみても、店主は移動しないこと。
    for (let i = 0; i < 10; i++) {
        // [待機]
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        expect(keeper1.x).toBe(19);
        expect(keeper1.y).toBe(6);
        expect(keeper2.x).toBe(19);
        expect(keeper2.y).toBe(12);
    }



    // // [装備]
    // RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, weapon1));
    // RESystem.dialogContext.postActivity(LActivity.makeEquip(actor1, shield1).withConsumeAction());
    // RESystem.dialogContext.activeDialog().submit();
    
    // RESystem.scheduler.stepSimulation();
    
    // const atk1 = actor1.atk;
    // const def1 = actor1.def;
    
    // // 武器と防具の強さが 50% になる Trait を持つ State 
    // actor1.addState(REData.getState("kState_UT魔法使い").id);

    // const atk2 = actor1.atk;
    // const def2 = actor1.def;

    // expect(atk1 > atk2).toBe(true);
    // expect(def1 > def2).toBe(true);
});
