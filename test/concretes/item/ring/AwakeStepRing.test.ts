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

test("concretes.item.ring.AwakeStepRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = MRBasics.states.nap;

    const player1 = TestEnv.setupPlayer(floorId, 16, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_アウェイクリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);
    
    const name = UName.makeNameAsItem(ring1);
    expect(name.includes("+")).toBe(false); // Issue 修正確認。修正値は持たない

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [stateId], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // 装備されていること。
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);
    expect(equipmens.isEquipped(ring1)).toBe(true);

    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // 必ず起きる
        expect(enemy1.isStateAffected(stateId)).toBe(false);
        
        // 元に戻す
        REGame.world.transferEntity(player1, floorId, 16, 4);
        enemy1.addState(stateId);
    }

    

    // for (let i = 0; i < 100; i++) {
    //     // 移動。部屋に入る
    //     RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    //     RESystem.dialogContext.activeDialog().submit();
        
    //     RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //     // ずっと寝ている
    //     expect(enemy1.isStateAffected(stateId)).toBe(true);
        
    //     // 元に戻す
    //     REGame.world._transferEntity(player1, floorId, 16, 4);
    // }
});
