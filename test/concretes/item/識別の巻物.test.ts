import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";
import { LIdentifyer } from "ts/objects/LIdentifyer";

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
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_識別の巻物").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kキュアリーフ").id, [], "item2"));
    inventory.addEntity(item2);

    const name1 = REGame.identifyer.makeDisplayText(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    {
        // [読む]
        const activity = LActivity.makeRead(actor1, item1, [item2]);
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        const name2 = REGame.identifyer.makeDisplayText(item2);
        expect(name1).not.toBe(name2);  // 少なくとも、識別の前後で表示名が変わっていること
    }
});

