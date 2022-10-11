import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";
import { assert } from "ts/mr/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.SleepStaff.basic", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_睡眠").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_睡眠の杖_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [振る]
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(enemy1.isStateAffected(stateId)).toBeTruthy();
});
