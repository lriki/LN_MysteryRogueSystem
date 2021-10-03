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
    // また、アイテム化された Gold を持っている
    expect(enemy1.x != 13 && enemy1.y != 10).toBe(true);
    expect(inventory2.hasAnyItem()).toBe(true);
    const item1 = inventory2.entities()[0];
    
    // Enemy を攻撃して倒す
    enemy1.setActualParam(DBasics.params.hp, 1);
    REGame.world._transferEntity(enemy1, floorId, 12, 11);  // 強制移動
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.x).toBe(12);
    expect(item1.y).toBe(11);
});
