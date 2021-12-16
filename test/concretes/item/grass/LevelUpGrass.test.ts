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
import { assert } from "ts/re/Common";
import { LActorBehavior } from "ts/re/objects/behaviors/LActorBehavior";
import { REBasics } from "ts/re/data/REBasics";
import { LExperienceBehavior } from "ts/re/objects/behaviors/LExperienceBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.LevelUpGrass", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const experience = player1.getEntityBehavior(LExperienceBehavior);
    const level1 = experience.level(player1);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kグロースドラッグ").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const a2 = player1.actualParam(REBasics.params.level);
    const level2 = experience.level(player1);
    expect(level2).toBe(level1 + 1);
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

