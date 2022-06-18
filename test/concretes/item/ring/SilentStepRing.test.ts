import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UName } from "ts/mr/usecases/UName";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.ring.SilentStepRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    const player1 = TestEnv.setupPlayer(floorId, 16, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_アウェイクガードリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);
    equipmentUser.equipOnUtil(ring1);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // 絶対に起きない
        expect(enemy1.isStateAffected(stateId)).toBe(true);
        
        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 16, 4);
        enemy1.addState(stateId);
    }
});

test("concretes.item.ring.SilentStepRing.Attack", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    const player1 = TestEnv.setupPlayer(floorId, 18, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_アウェイクガードリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);
    equipmentUser.equipOnUtil(ring1);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(enemy1.isStateAffected(stateId)).toBe(false);
});

