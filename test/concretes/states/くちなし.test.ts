import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.くちなし.Basic", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTくちなし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_識別の巻物A").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(false); // 食べられないので削除されてはいない

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(false); // 読めないので削除されてはいない
});

test("concretes.states.くちなし.AutoRemove", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTくちなし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);

    // 別フロアへ移動
    MRLively.world.transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // フロア移動でステート解除
    expect(!!actor1.states.find(x => x.stateDataId() == stateId)).toBe(false);
});
