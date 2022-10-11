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
import { LActionTokenType } from "ts/mr/lively/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.PowerGrass.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const pow1 = player1.actualParam(MRBasics.params.pow);
    expect(pow1).toBe(8);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_ちからの草_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_ちからの草_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);
    
    // "草" の共通テスト
    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(MRBasics.params.pow, pow1 - 1);

    // [食べる] 1個め
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // ちからが回復する
    const pow2 = player1.actualParam(MRBasics.params.pow);
    expect(pow2).toBe(pow1);

    // メッセージは "回復した" でOK. 原作は違ったかもしれないが、これを細かくデータ駆動で指定するのはちょっと大変。
    const message = MRLively.messageHistory;
    expect(message.includesText("回復した")).toBe(true);
    expect(message.includesText("増えた")).toBe(false);

    //----------------------------------------------------------------------------------------------------

    // [食べる] 2個め
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 最大値も含め、ちからが増えている
    const powMax = player1.idealParam(MRBasics.params.pow);
    const pow3 = player1.actualParam(MRBasics.params.pow);
    expect(powMax).toBe(pow2 + 1);
    expect(pow3).toBe(pow2 + 1);

    expect(message.includesText("最大値が 1 増えた")).toBe(true);
});

