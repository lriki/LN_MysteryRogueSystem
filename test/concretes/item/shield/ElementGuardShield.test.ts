import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REBasics } from "ts/re/data/REBasics";
import { UName } from "ts/re/usecases/UName";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.shield.ElementGuardShield", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const hp1 = player1.actualParam(REBasics.params.hp);

    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kドラゴンシールド").id, [], "shield1"));
    inventory.addEntity(shield1);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ドラゴンA").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_Anger").id);
    REGame.world._transferEntity(enemy1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 盾未装備で一度ダメージを受けてみる

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp2 = player1.actualParam(REBasics.params.hp);

    //----------------------------------------------------------------------------------------------------
    // 盾装備でダメージを受けてみる

    player1.setActualParam(REBasics.params.hp, hp1);    // 回復
    equipmentUser.equipOnUtil(shield1);

    // [待機]
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const hp3 = player1.actualParam(REBasics.params.hp);

    const damage1 = hp1 - hp2;
    const damage2 = hp1 - hp3;
    expect(damage2).toBeLessThan(damage1);  // ダメージが減少している
});
