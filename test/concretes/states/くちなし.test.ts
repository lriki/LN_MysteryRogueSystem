import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.くちなし.Basic", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UTくちなし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kキュアリーフ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_識別の巻物").id, [], "item2"));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(false); // 食べられないので削除されてはいない

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(false); // 読めないので削除されてはいない
});

test("concretes.states.くちなし.AutoRemove", () => {
    TestEnv.newGame();
    const stateId = REData.getStateFuzzy("kState_UTくちなし").id;

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(stateId);
    REGame.world._transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // フロア移動でステート解除
    expect(!!actor1.states().find(x => x.stateDataId() == stateId)).toBe(false);
});
