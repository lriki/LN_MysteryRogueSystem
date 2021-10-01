import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LGoldBehavior } from "ts/re/objects/behaviors/LGoldBehavior";
import { DBasics } from "ts/re/data/DBasics";
import { SFormulaOperand } from "ts/re/system/SFormulaOperand";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.Gold", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    
    // gold1 - 地面に配置
    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_Gold").id, [], "gold1"));
    gold1.getEntityBehavior(LGoldBehavior).setGold(1000);
    REGame.world._transferEntity(gold1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // gold2 - インベントリに入れる
    const gold2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_Gold").id, [], "gold2"));
    gold2.getEntityBehavior(LGoldBehavior).setGold(200);
    inventory1.addEntity(gold2);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 13, 10);
    const hp1 = enemy1.actualParam(DBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [拾う]
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // GoldItem は消え、所持金が増えている
    expect(gold1.isDestroyed()).toBe(true);
    expect(inventory1.gold()).toBe(1000);

    const a = new SFormulaOperand();
    a.wrap(actor1);
    const ev = eval("a.HP");

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, gold2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 投げ当てた時は、1/10 の固定ダメージ
    const hp2 = enemy1.actualParam(DBasics.params.hp);
    expect(hp1 - hp2).toBe(20);
    expect(gold2.isDestroyed()).toBe(true);
});

