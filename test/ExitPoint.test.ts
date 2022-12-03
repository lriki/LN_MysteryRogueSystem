import { assert } from "ts/mr/Common";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("ExitPoint.Reactions", () => {
    TestEnv.newGame();

    const floor = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_UTドラゴン(ランダム)");

    // Player
    const actor1 = TestEnv.setupPlayer(floor);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = MRLively.camera.currentMap.entities();
    const exitpoint = entites.find(x => x.data.entity.key == "kEntity_ExitPointA");
    assert(exitpoint);
    const reactions = exitpoint.queryReactions();
    expect(reactions.length).toBe(1);
    expect(reactions[0].actionId).toBe(MRBasics.actions.ForwardFloorActionId);
});
