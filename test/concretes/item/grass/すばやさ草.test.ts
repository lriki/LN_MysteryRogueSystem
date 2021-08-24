import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../../TestEnv";
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

test("concretes.item.grass.すばやさ草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item1"));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    // [食べる] ができる
    expect(item1.queryReactions().includes(DBasics.actions.EatActionId)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

});

