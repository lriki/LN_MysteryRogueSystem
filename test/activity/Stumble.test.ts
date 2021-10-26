import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.activity.Stumble.player", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory.addEntity(weapon1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [転ぶ]
    const act = (new LActivity()).setup(REBasics.actions.stumble, player1);
    RESystem.dialogContext.postActivity(act.withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 持ち物が前方に落ちる
    const item1 = REGame.map.block(11, 10).getFirstEntity();
    expect(item1).toBe(weapon1);
});

test("concretes.activity.Stumble.enemy", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 13, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy を転ばせて自分は待機
    const act1 = (new LActivity()).setup(REBasics.actions.stumble, enemy1);
    RESystem.dialogContext.postActivity(act1);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 何か足元に落ちてる
    const item1 = REGame.map.block(13, 10).getFirstEntity();
    expect(item1 !== undefined).toBe(true);
    expect(enemy1.x).toBe(12);

    //----------------------------------------------------------------------------------------------------

    // Enemy を転ばせて自分は待機
    const act2 = (new LActivity()).setup(REBasics.actions.stumble, enemy1);
    RESystem.dialogContext.postActivity(act2);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 2回目は何も落とさない
    const item2 = REGame.map.block(12, 10).getFirstEntity();
    expect(item2 === undefined).toBe(true);
});

