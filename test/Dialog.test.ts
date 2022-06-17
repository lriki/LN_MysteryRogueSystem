import { assert } from "ts/re/Common";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/re/objects/LFloorId";
import { MRBasics } from "ts/re/data/MRBasics";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SMotionSequel } from "ts/re/system/SSequel";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Dialog.FeetDialogSequelTiming", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    const exitPoint1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ExitPoint_A").id, [], ""));
    REGame.world.transferEntity(exitPoint1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Dialog 表示と同時に、Sequel も Flush されること。
    const set = TestEnv.activeSequelSet;
    const sequel = set.runs()[0].clips()[0].sequels()[0] as SMotionSequel;
    expect(sequel.sequelId()).toBe(MRBasics.sequels.MoveSequel);
});
