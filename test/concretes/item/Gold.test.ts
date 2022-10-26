import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LGoldBehavior } from "ts/mr/lively/behaviors/LGoldBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SFormulaOperand } from "ts/mr/system/SFormulaOperand";
import { LActionTokenType } from "ts/mr/lively/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.Gold", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    
    // gold1 - 地面に配置
    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_GoldA").id, [], "gold1"));
    gold1.getEntityBehavior(LGoldBehavior).setGold(1000);
    MRLively.world.transferEntity(gold1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // gold2 - インベントリに入れる
    const gold2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_GoldA").id, [], "gold2"));
    gold2.getEntityBehavior(LGoldBehavior).setGold(200);
    inventory1.addEntity(gold2);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 13, 10);
    const hp1 = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [拾う]
    MRSystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // GoldItem は消え、所持金が増えている
    expect(gold1.isDestroyed()).toBe(true);
    expect(inventory1.gold()).toBe(1000);

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(actor1, gold2).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 投げ当てた時は、1/10 の固定ダメージ
    const hp2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp1 - hp2).toBe(20);
    expect(gold2.isDestroyed()).toBe(true);
});

