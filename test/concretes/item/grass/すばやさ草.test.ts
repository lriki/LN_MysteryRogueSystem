import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.すばやさ草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item2"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item3"));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getBehavior(LInventoryBehavior).addEntity(item2);
    actor1.getBehavior(LInventoryBehavior).addEntity(item3);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassBegin(actor1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる] 1個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速になる
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(2);

    // [食べる] 2個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 3倍速になる
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(3);

    // [食べる] 3個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item3).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 3倍速以上には増えない
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(3);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassEnd(actor1, item1);
});

