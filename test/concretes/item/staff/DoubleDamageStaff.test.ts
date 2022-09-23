import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.DoubleDamageStaff.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const player1HP1 = player1.actualParam(MRBasics.params.hp);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_もろはの杖_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [振る] (壁に向かって)
    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(8).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 相手に効果が無ければ、自分にダメージもない
    const player1HP2 = player1.actualParam(MRBasics.params.hp);
    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    expect(player1HP2).toBe(player1HP1);
    expect(enemy1HP2).toBe(enemy1HP1);

    //----------------------------------------------------------------------------------------------------

    // [振る] (相手に向かって)
    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 相手に効果が出れば、自分にも効果がでる
    const player1HP3 = player1.actualParam(MRBasics.params.hp);
    const enemy1HP3 = enemy1.actualParam(MRBasics.params.hp);
    expect(player1HP3).toBeLessThanOrEqual(Math.floor(player1HP1 / 2) + 5);    // 自動回復で若干 HP が回復しているので +5 くらいで判定
    expect(enemy1HP3).toBe(1);

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(MRBasics.params.hp, 1);
    enemy1.setActualParam(MRBasics.params.hp, 1);

    RESystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const player1HP4 = player1.actualParam(MRBasics.params.hp);
    const enemy1HP4 = enemy1.actualParam(MRBasics.params.hp);
    expect(player1HP4).toBe(0);
});
