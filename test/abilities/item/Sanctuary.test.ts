import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { DialogSubmitMode } from "ts/system/SDialog";
import { LSanctuaryBehavior } from "ts/objects/behaviors/LSanctuaryBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Sanctuary", () => {
    SGameManager.createGameObjects();
    const dc = RESystem.dialogContext;

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // item1: actor1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntityFromPrefabName("pふきとばしの杖");
    item1._name = "item1";
    item1.addBehavior(LSanctuaryBehavior);
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は聖域を避け、左折の法則に従って進行方向の左前に進んでいる
    expect(enemy1.x).toBe(11);
    expect(enemy1.y).toBe(11);
});
