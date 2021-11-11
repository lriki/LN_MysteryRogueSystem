import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REBasics } from "ts/re/data/REBasics";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.PowerGrass.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const pow1 = player1.actualParam(REBasics.params.pow);
    expect(pow1).toBe(8);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kパワードラッグ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kパワードラッグ").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(REBasics.params.pow, pow1 - 1);

    // [食べる] 1個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ちからが回復する
    const pow2 = player1.actualParam(REBasics.params.pow);
    expect(pow2).toBe(pow1);

    //----------------------------------------------------------------------------------------------------

    // [食べる] 2個め
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大値も含め、ちからが増えている
    const powMax = player1.idealParam(REBasics.params.pow);
    const pow3 = player1.actualParam(REBasics.params.pow);
    expect(powMax).toBe(pow2 + 1);
    expect(pow3).toBe(pow2 + 1);
});

