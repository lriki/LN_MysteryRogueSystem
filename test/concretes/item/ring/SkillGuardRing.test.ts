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
import { LActorBehavior } from "ts/re/objects/behaviors/LActorBehavior";
import { LExperienceBehavior } from "ts/re/objects/behaviors/LExperienceBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.ring.SkillGuardRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const experience = player1.getEntityBehavior(LExperienceBehavior);
    experience.setLevel(player1, 99);
    const hp1 = player1.actualParam(REBasics.params.hp);

    // Item
    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kインプリング").id, [], "ring1"));
    inventory.addEntity(ring1);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ミステリーインプA").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_UTからぶり").id);
    REGame.world._transferEntity(enemy1, floorId, 11, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 先にレベル下げが働くことをチェックしておく
    for (let i = 0; i < 50; i++) {
        player1.setActualParam(REBasics.params.hp, hp1);
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    }

    expect(experience.level(player1) < 99).toBe(true);

    //----------------------------------------------------------------------------------------------------

    experience.setLevel(player1, 99);
    equipmentUser.equipOnUtil(ring1);

    let count = 0;
    for (let i = 0; i < 50; i++) {
        player1.setActualParam(REBasics.params.hp, hp1);
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        const level1 = experience.level(player1);
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        if (experience.level(player1) < level1) count++;
    }

    expect(count).toBe(0);
});

