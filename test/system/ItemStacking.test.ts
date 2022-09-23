import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// アイテムがいっぱいの状態で矢を拾おうとすると矢の本数が加算されない問題の修正確認
test("system.ItemStacking.FullyInventoryIssue", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 5本の矢を作り、持ち物に入れる
    const arrow1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢_A").id, [], "item1").withStackCount(5));
    inventory.addEntity(arrow1);

    // 5本の矢を作り、足元に置く
    const arrow2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢_A").id, [], "item1").withStackCount(5));
    REGame.world.transferEntity(arrow2, floorId, 10, 10);

    // 残り持てる数だけ適当なアイテムを持たせる
    const remaining = inventory.remaining;
    for (let i = 0; i < remaining; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item"));
        inventory.addEntity(item);
    }

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [拾う]
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(arrow2.isDestroyed()).toBeTruthy();  // 足元のアイテムは持ち物に統合され、消えていること
    expect(arrow1._stackCount).toBe(10);        // 持ち物に入れられた矢は残り10本となっていること
});

