

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
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id, [], "item1"));
    inventory.addEntity(item1);
    
    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id, [], "item2"));
    REGame.world._transferEntity(item2, floorId, 10, 10);  // Player の足元へ
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_レッドスライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    

    expect(item1._stackCount).toBe(2);      // スタックが増えている
    expect(item2.isDestroyed()).toBeTruthy(); // item1 へスタックされ、item2 自体は消える

    //----------------------------------------------------------------------------------------------------

    // item1 は [撃つ] ことができる
    expect(item1.queryReactions().includes(REBasics.actions.ShootingActionId)).toBeTruthy();
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.actualParam(REBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
    expect(item1._stackCount).toBe(1);      // スタックが減っている
});

