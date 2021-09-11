import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";
import { LIdentifyer } from "ts/objects/LIdentifyer";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.混乱草", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kパニックドラッグ").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kパニックドラッグ").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 混乱状態になる
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT混乱").id)).toBe(true);

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 混乱状態になる
    expect(!!enemy1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT混乱").id)).toBe(true);
});

