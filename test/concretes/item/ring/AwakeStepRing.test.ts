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

test("concretes.item.ring.AwakeStepRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REBasics.states.nap;

    const player1 = TestEnv.setupPlayer(floorId, 16, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kアウェイクリング").id, [], "ring1"));
    inventory.addEntity(ring1);
    
    const name = UName.makeNameAsItem(ring1);
    expect(name.includes("+")).toBe(false); // Issue 修正確認。修正値は持たない

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 19, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // 装備されていること。
    const equipmens = player1.getEntityBehavior(LEquipmentUserBehavior);
    expect(equipmens.isEquipped(ring1)).toBe(true);
    
    // //----------------------------------------------------------------------------------------------------

    // // [はずす]
    // RESystem.dialogContext.postActivity(LActivity.makeEquipOff(player1, ring1).withConsumeAction());
    // RESystem.dialogContext.activeDialog().submit();
    
    // RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // // 外れていること。
    // expect(equipmens.isEquipped(ring1)).toBe(false);

    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // 移動。部屋に入る
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // 必ず起きる
        expect(enemy1.isStateAffected(stateId)).toBe(false);
        
        // 元に戻す
        REGame.world._transferEntity(player1, floorId, 16, 4);
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