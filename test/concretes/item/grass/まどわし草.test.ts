import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.まどわし草", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_マッドドラッグ_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_マッドドラッグ_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // まどわし状態になる
    expect(!!player1.states().find(x => x.stateDataId() == MRData.getState("kState_UTまどわし").id)).toBe(true);

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // まどわし状態になる
    expect(!!enemy1.states().find(x => x.stateDataId() == MRData.getState("kState_UTまどわし").id)).toBe(true);
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

