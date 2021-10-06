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

test("concretes.enemies.ArrowShooter", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    //actor1.addState(REData.getStateFuzzy("kState_UT身かわし").id);
    REGame.world._transferEntity(actor1, floorId, 10, 10);
    TestEnv.performFloorTransfer();
    const hp1 = actor1.actualParam(REBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_アローインプ").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 12, 10);

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();

    // 離れていれば 100% 矢を撃ってくる
    const hp2 = actor1.actualParam(REBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    //----------------------------------------------------------------------------------------------------
    
    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();

    // 隣接していても 100% 矢を撃ってくる
    const hp3 = actor1.actualParam(REBasics.params.hp);
    expect(hp3 < hp2).toBe(true);
});

