import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { MRBasics } from "ts/re/data/MRBasics";
import { UName } from "ts/re/usecases/UName";
import { TestEnv } from "test/TestEnv";
import { SView } from "ts/re/system/SView";

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

    const ring1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ビジブルリング_A").id, [], "ring1"));
    inventory.addEntity(ring1);
   //equipmentUser.equipOnUtil(ring1);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_インビジブルバットA").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 10);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    const visibility1 = SView.getEntityVisibility(enemy1);
    expect(visibility1.visible).toBeFalsy();    // 一応確認

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, ring1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

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
