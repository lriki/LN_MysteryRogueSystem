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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.ItemThief.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);

    // Item1作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kキュアリーフ").id, [], "item1"));
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_プレゼンにゃー").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy の目の前へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Player のインベントリにあったアイテムが盗まれ、Enemy のインベントリに移動している
    expect(inventory1.entities().length).toBe(0);
    expect(inventory2.entities().length).toBe(1);
    expect(inventory2.contains(item1)).toBe(true);

    // Enemy1 はワープしている
    expect(enemy1.x != 12).toBe(true);
    expect(enemy1.y != 10).toBe(true);

    // Enemy を攻撃して倒す
    enemy1.setActualParam(DBasics.params.hp, 1);
    REGame.world._transferEntity(enemy1, floorId, 12, 10);
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.x).toBe(12);
    expect(item1.y).toBe(10);
});