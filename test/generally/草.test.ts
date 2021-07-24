import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { TileShape } from "ts/objects/LBlock";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { DEntity, DEntityCreateInfo } from "ts/data/DEntity";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { DialogSubmitMode } from "ts/system/SDialog";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { REData } from "ts/data/REData";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("generally.草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kキュアリーフ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kキュアリーフ").id, [], "item2"));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getBehavior(LInventoryBehavior).addEntity(item2);

    const name1 = REGame.identifyer.makeDisplayText(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    const activity = LActivity.makeEat(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const name2 = REGame.identifyer.makeDisplayText(item2);

    // 食べれば、同種のアイテムは識別される。
    expect(name2).not.toBe(name1);
});
