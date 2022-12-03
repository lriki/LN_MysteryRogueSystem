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
import { SView } from "ts/mr/system/SView";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.ring.VisibleRing", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const stateId = MRBasics.states.nap;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_影読みの指輪A").id, [], "ring1"));
    inventory.addEntity(ring1);
   //equipmentUser.equipOnUtil(ring1);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_黒幕バットA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, floorId, 13, 10);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    const visibility1 = SView.getEntityVisibility(enemy1);
    expect(visibility1.visible).toBeFalsy();    // 一応確認

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const visibility2 = SView.getEntityVisibility(enemy1);
    expect(visibility2.visible).toBeTruthy();
    
    //----------------------------------------------------------------------------------------------------

    // for (let i = 0; i < 100; i++) {
    //     // 移動。部屋に入る
    //     RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    //     RESystem.dialogContext.activeDialog().submit();
        
    //     RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //     // 絶対に起きない
    //     expect(enemy1.isStateAffected(stateId)).toBe(true);
        
    //     // 元に戻す
    //     REGame.world._transferEntity(player1, floorId, 16, 4);
    //     enemy1.addState(stateId);
    // }
});
