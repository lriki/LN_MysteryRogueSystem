import { assert } from "ts/mr/Common";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SEntityFactory } from "ts/mr/system/internal";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { MRData } from "ts/mr/data/MRData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("ExitPoint.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const exitPoint1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ExitPointA").id, [], "exitPoint1"));
    TestEnv.transferEntity(exitPoint1, floorId, 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const dialog = new SFeetDialog(player1, exitPoint1);
    MRSystem.dialogContext.activeDialog().openSubDialog(dialog);

    const commands = dialog.makeActionList();
    expect(commands.length).toBe(1);
    expect(commands[0].actionId).toBe(MRBasics.actions.ForwardFloorActionId);   // [進む]
    commands[0].execute();

    //MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 次のフロアに移動できているはず
    // TODO: 今のところ RMMZ のイベントから実行しているので、UnitTest では評価できない
    //expect(player1.floorId.floorNumber).toBe(floorId.floorNumber + 1);

});
