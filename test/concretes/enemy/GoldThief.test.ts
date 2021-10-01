import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { DBasics } from "ts/re/data/DBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LGoldBehavior } from "ts/re/objects/behaviors/LGoldBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.GoldThief.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    inventory1.gainGold(10000);

    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_Gold").id, [], "gold1"));
    gold1.getEntityBehavior(LGoldBehavior).setGold(1000);
    REGame.world._transferEntity(gold1, floorId, 13, 10);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ゴールドにゃー").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    // □□□□□
    // Ｐ□敵金□
    // □□□□□
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy は Gold の上に移動している
    expect(enemy1.x).toBe(13);
    expect(enemy1.y).toBe(10);

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy は Gold の上に居座っている
    expect(enemy1.x).toBe(13);
    expect(enemy1.y).toBe(10);

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy1 はワープしている
    expect(enemy1.x).not.toBe(13);
    expect(enemy1.y).not.toBe(10);
    
});
