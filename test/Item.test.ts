import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Stack", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 矢1本
    const info1 = DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id);
    info1.stackCount = 1;
    const item1 = SEntityFactory.newEntity(info1);
    REGame.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 矢2本
    const info2 = DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id);
    info2.stackCount = 2;
    const item2 = SEntityFactory.newEntity(info2);
    REGame.world.transferEntity(item2, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(item1._stackCount).toBe(3);  // 3本にまとめられている

    // 矢99本
    const info3 = DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id);
    info3.stackCount = 99;
    const item3 = SEntityFactory.newEntity(info3);
    REGame.world.transferEntity(item3, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(item1._stackCount).toBe(99);  // 99本が最大

    // 矢1本
    const item4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ウッドアロー_A").id));
    REGame.world.transferEntity(item4, TestEnv.FloorId_FlatMap50x50, 10, 10);  // Player の足元へ

    // 足元のアイテムを拾う
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(item1._stackCount).toBe(99);  // 99本が最大

    expect(item2.isDestroyed()).toBe(true); // item1 へスタックされ、item2 自体は消える
    expect(item3.isDestroyed()).toBe(true); // item1 へスタックされ、item3 自体は消える
    expect(item4.isDestroyed()).toBe(true); // item1 へスタックされ、item4 自体は消える
});

