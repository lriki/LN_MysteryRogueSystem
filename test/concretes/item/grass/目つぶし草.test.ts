import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.目つぶし草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kブラインドドラッグ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kブラインドドラッグ").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(actor1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // めつぶし状態になる
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getState("kState_UT目つぶし").id)).toBe(true);

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item2).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // めつぶし状態になる
    expect(!!enemy1.states().find(x => x.stateDataId() == REData.getState("kState_UT目つぶし").id)).toBe(true);
    
    TestUtils.testCommonGrassEnd(actor1, item1);
});

