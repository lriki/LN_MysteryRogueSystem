import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { TestEnv } from "test/TestEnv";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";

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
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // Item
    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_インプよけの指輪_A").id, [], "ring1"));
    inventory.addEntity(ring1);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_くねくねインプ_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    MRLively.world.transferEntity(enemy1, floorId, 11, 4);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 先にレベル下げが働くことをチェックしておく
    for (let i = 0; i < 50; i++) {
        player1.setParamCurrentValue(MRBasics.params.hp, hp1);
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    }

    expect(experience.level(player1) < 99).toBe(true);

    //----------------------------------------------------------------------------------------------------

    experience.setLevel(player1, 99);
    equipmentUser.equipOnUtil(ring1);

    let count = 0;
    for (let i = 0; i < 50; i++) {
        player1.setParamCurrentValue(MRBasics.params.hp, hp1);
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        const level1 = experience.level(player1);
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        if (experience.level(player1) < level1) count++;
    }

    expect(count).toBe(0);
});

