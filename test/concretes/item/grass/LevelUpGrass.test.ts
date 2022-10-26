import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_しあわせ草_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const a2 = player1.getActualParam(MRBasics.params.level);
    const level2 = experience.level(player1);
    expect(level2).toBe(level1 + 1);
    
    TestUtils.testCommonGrassEnd(player1, item1);

    // レベルアップメッセージは "回復した" ではなく "【変更後の値】に上がった" と表示される
    const message = MRLively.messageHistory;
    expect(message.includesText("回復した")).toBeFalsy();
    expect(message.includesText("2 に上がった")).toBeTruthy();
});

