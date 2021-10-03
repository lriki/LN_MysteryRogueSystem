import { DBasics } from "ts/re/data/DBasics";
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

test("concretes.item.grass.火炎草.test", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 11, 10);

    enemy1.params().param(DBasics.params.hp)?.setIdealParamPlus(500);
    enemy1.setActualParam(DBasics.params.hp, 500);
    const hp1 = enemy1.actualParam(DBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("k火炎草70_50").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("k火炎草70_50").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(actor1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy はダメージを受ける
    const hp2 = enemy1.actualParam(DBasics.params.hp);
    expect(hp2 < hp1).toBe(true);
    
    // Enemy の HP をリセット
    enemy1.setActualParam(DBasics.params.hp, 500);

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item2).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy はダメージを受ける。ただし、投げ当てた時のダメージ量は飲んだ時よりも少ない。
    const hp3 = enemy1.actualParam(DBasics.params.hp);
    expect(hp3 < hp1).toBe(true);
    expect((hp1 - hp3) < (hp1 - hp2)).toBe(true);
    
    TestUtils.testCommonGrassEnd(actor1, item1);
});

