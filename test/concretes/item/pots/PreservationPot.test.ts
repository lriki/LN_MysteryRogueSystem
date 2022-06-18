import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LGoldBehavior } from "ts/mr/objects/behaviors/LGoldBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SFormulaOperand } from "ts/mr/system/SFormulaOperand";
import { LActionTokenType } from "ts/mr/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.pots.PreservationPot.Basic", () => {
    /*
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_保存の壺_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_キュアリーフ_A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);


    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    */
});

