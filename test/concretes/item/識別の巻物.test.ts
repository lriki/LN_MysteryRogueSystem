import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { UName } from "ts/re/usecases/UName";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.item.識別の巻物", () => {
    TestEnv.newGame();

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_識別の巻物").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kキュアリーフ").id, [], "item2"));
    inventory.addEntity(item2);

    const name1 = UName.makeNameAsItem(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    {
        // [読む]
        const activity = LActivity.makeRead(actor1, item1, [item2]).withConsumeAction(LActionTokenType.Major);
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        const name2 = UName.makeNameAsItem(item2);
        expect(name1).not.toBe(name2);  // 少なくとも、識別の前後で表示名が変わっていること
    }
});

