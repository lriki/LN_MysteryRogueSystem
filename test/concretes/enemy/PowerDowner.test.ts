import { assert } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REBasics } from "ts/re/data/REBasics";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemies.PowerDowner", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    const pow1 = actor1.actualParam(REBasics.params.pow);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ゾンビ屋").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    REGame.world.random().resetSeed(5);     // 乱数調整

    RESystem.scheduler.stepSimulation();

    // ちからが減っている
    const pow2 = actor1.actualParam(REBasics.params.pow);
    expect(pow2).toBe(pow1 - 1);
});

