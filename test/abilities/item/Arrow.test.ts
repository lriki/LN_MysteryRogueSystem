

import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LEnemyBehavior } from "ts/objects/behaviors/LEnemyBehavior";
import { LItemBehavior } from "ts/objects/behaviors/LItemBehavior";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { LActivity } from "ts/objects/activities/LActivity";

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
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kウッドアロー").id));
    item2._name = "item2";
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.getEnemy("kEnemy_ウルフ").entity());
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);
    const initialHP = enemy1.actualParam(DBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(actor1));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item2.isDestroyed()).toBe(true); // item1 へスタックされ、item2 自体は消える

    //----------

    // item1 は [撃つ] ことができる (※[撃つ] と [投げる] は同じ Action)
    expect(item1.queryReactions().includes(DBasics.actions.ThrowActionId)).toBe(true);
    
    // [撃つ]
    const activity1 = LActivity.makeThrow(actor1, item1);
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const data = REData.getEntity("kウッドアロー");

    const hp = enemy1.actualParam(DBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

