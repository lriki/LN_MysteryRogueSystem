

import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Arrow", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    item2._name = "item2";
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.getEnemy("kEnemy_レッドスライムA").entity());
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const initialHP = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    

    expect(item1._stackCount).toBe(2);      // スタックが増えている
    expect(item2.isDestroyed()).toBe(true); // item1 へスタックされ、item2 自体は消える

    //----------------------------------------------------------------------------------------------------

    // item1 は [撃つ] ことができる
    expect(item1.queryReactions().includes(REBasics.actions.ShootingActionId)).toBe(true);
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.actualParam(REBasics.params.hp);
    expect(hp < initialHP).toBe(true);      // ダメージを受けているはず
    expect(item1._stackCount).toBe(1);      // スタックが減っている
});

