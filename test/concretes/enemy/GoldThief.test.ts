import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { MRBasics } from "ts/re/data/MRBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LGoldBehavior } from "ts/re/objects/behaviors/LGoldBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { assert } from "ts/re/Common";

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

    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_Gold_A").id, [], "gold1"));
    gold1.getEntityBehavior(LGoldBehavior).setGold(1000);
    REGame.world.transferEntity(gold1, floorId, 13, 10);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゴールドにゃーA").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 12, 10);
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
    expect(enemy1.mx).toBe(13);
    expect(enemy1.my).toBe(10);

    // 右へ移動。まだ隣接しない
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy は Gold の上に居座っている
    expect(enemy1.mx).toBe(13);
    expect(enemy1.my).toBe(10);

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy1 はワープしている
    // また、アイテム化された Gold を持っている
    expect(enemy1.mx != 13 && enemy1.my != 10).toBe(true);
    expect(inventory2.hasAnyItem()).toBe(true);
    const item1 = inventory2.items[0];
    
    // Enemy を攻撃して倒す
    enemy1.setActualParam(MRBasics.params.hp, 1);
    REGame.world.transferEntity(enemy1, floorId, 12, 11);  // 強制移動
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 2).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.mx).toBe(12);
    expect(item1.my).toBe(11);
});

test("concretes.enemy.GoldThief.DropItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゴールドにゃーA").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy を攻撃して倒す
    enemy1.setActualParam(MRBasics.params.hp, 1);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている。ドロップ率 100%
    expect(enemy1.isDestroyed()).toBe(true);
    const item = REGame.map.block(11, 10).getFirstEntity();
    assert(item);
    expect(!!item.findEntityBehavior(LGoldBehavior)).toBe(true);
});

