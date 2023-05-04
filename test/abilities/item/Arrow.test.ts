

import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";

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
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1"));
    inventory.addEntity(item1);
    const stack1 = item1._stackCount;
    
    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item2"));
    TestEnv.transferEntity(item2, floorId, 10, 10);  // Player の足元へ
    const stack2 = item2._stackCount;
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_飴色スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 足元のアイテムを拾う
    MRSystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    

    expect(item1._stackCount).toBe(stack1 + stack2);      // スタックが増えている
    expect(item2.isDestroyed()).toBeTruthy(); // item1 へスタックされ、item2 自体は消える

    //----------------------------------------------------------------------------------------------------

    // item1 は [撃つ] ことができる
    expect(!!item1.queryReactions().find(x => x.actionId == MRBasics.actions.ShootActionId)).toBeTruthy();
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず
    expect(item1._stackCount).toBe(stack1 + stack2 - 1);      // スタックが減っている
});

