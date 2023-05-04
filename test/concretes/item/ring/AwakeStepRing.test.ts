import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UName } from "ts/mr/utility/UName";
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

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_目覚めの指輪A").id, [], "ring1"));
    inventory.addEntity(ring1);
    
    const name = UName.makeNameAsItem(ring1);
    expect(name.includes("+")).toBe(false); // Issue 修正確認。修正値は持たない

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [stateId], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 19, 4);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // 装備されていること。
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);
    expect(equipmens.isEquipped(ring1)).toBe(true);

    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // 必ず起きる
        expect(enemy1.isStateAffected(stateId)).toBe(false);
        
        // 元に戻す
        TestEnv.transferEntity(player1, floorId, 16, 4);
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
