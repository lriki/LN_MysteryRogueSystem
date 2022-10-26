import { assert } from "ts/mr/Common";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SMotionSequel } from "ts/mr/system/SSequel";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Dialog.FeetDialogSequelTiming", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    const exitPoint1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ExitPointA").id, [], ""));
    MRLively.world.transferEntity(exitPoint1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Dialog 表示と同時に、Sequel も Flush されること。
    const set = TestEnv.activeSequelSet;
    const sequel = set.runs()[0].clips()[0].sequels()[0] as SMotionSequel;
    expect(sequel.sequelId()).toBe(MRBasics.sequels.MoveSequel);
});
