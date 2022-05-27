import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REBasics } from "ts/re/data/REBasics";
import { assert } from "ts/re/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.HalfDamageStaff.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ハーフの杖_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const enemy1HP1 = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [振る]
    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const enemy1HP2 = enemy1.actualParam(REBasics.params.hp);
    expect(enemy1HP2).toBe(Math.floor(enemy1HP1 / 2));

    //----------------------------------------------------------------------------------------------------

    // HP1 にしておく
    enemy1.setActualParam(REBasics.params.hp, 1);

    // [振る]
    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // HP1 で効果を受けたら戦闘不能
    const enemy1HP3 = enemy1.actualParam(REBasics.params.hp);
    expect(enemy1HP3).toBe(0);
    expect(enemy1.isDestroyed()).toBeTruthy();
});
