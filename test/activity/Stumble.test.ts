import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.activity.Stumble.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory2 = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [], "shield1"));
    inventory2.addEntity(weapon1);
    inventory2.addEntity(shield1);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [転ぶ]
    const act = (new LActivity()).setup(REBasics.actions.stumble, player1);
    RESystem.dialogContext.postActivity(act.withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const item1 = REGame.map.block(11, 10).getFirstEntity();
    expect(item1).toBe(weapon1);
});
