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
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = MRLively.map.entities();
    const exitpoint = entites.find(x => x.data.entity.key == "kEntity_ExitPoint_A");
    assert(exitpoint);
    const reactions = exitpoint.queryReactions();
    expect(reactions.length).toBe(1);
    expect(reactions[0].actionId).toBe(MRBasics.actions.ForwardFloorActionId);
});
