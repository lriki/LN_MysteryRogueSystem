import { TestEnv } from "../../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.pots.PreservationPot.Basic", () => {
    /*
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_薬草A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);


    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    */
});

