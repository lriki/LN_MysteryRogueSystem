import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { UName } from "ts/mr/usecases/UName";
import { LActionTokenType } from "ts/mr/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("generally.草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_キュアリーフ_A").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    const name1 = UName.makeNameAsItem(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const name2 = UName.makeNameAsItem(item2);

    // 食べれば、同種のアイテムは識別される。
    expect(name2).not.toBe(name1);
});
