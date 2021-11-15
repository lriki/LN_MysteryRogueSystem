import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.Rust", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory2 = player1.getEntityBehavior(LInventoryBehavior);
    
    // 武器 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [], "weapon1"));
    inventory2.addEntity(weapon1);
    const weapon1_UP1 = weapon1.actualParam(REBasics.params.upgradeValue);

    // 盾 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [], "shield1"));
    inventory2.addEntity(shield1);
    const shield1_UP1 = shield1.actualParam(REBasics.params.upgradeValue);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_グールA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [装備], [待機]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const weapon1_UP2 = weapon1.actualParam(REBasics.params.upgradeValue);
    const shield1_UP2 = shield1.actualParam(REBasics.params.upgradeValue);

    expect(weapon1_UP2 == weapon1_UP1 - 1).toBe(true);
    expect(shield1_UP2 == shield1_UP1 - 1).toBe(true);
});
