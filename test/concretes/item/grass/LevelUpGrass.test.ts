import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/objects/LActionToken";
import { assert } from "ts/mr/Common";
import { LActorBehavior } from "ts/mr/objects/behaviors/LActorBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LExperienceBehavior } from "ts/mr/objects/behaviors/LExperienceBehavior";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_グロースドラッグ_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const a2 = player1.actualParam(MRBasics.params.level);
    const level2 = experience.level(player1);
    expect(level2).toBe(level1 + 1);
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

