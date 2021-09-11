import { assert } from "ts/re/Common";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/re/objects/LFloorId";
import { DBasics } from "ts/re/data/DBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("ExitPoint.Reactions", () => {
    TestEnv.newGame();

    const floor = LFloorId.makeFromKeys("RE-Land:UnitTestDungeon1", "kFloor_UTドラゴン(ランダム)");

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = REGame.map.entities();
    const exitpoint = entites.find(x => x.data().entity.key == "kExitPoint");
    assert(exitpoint);
    const reactions = exitpoint.queryReactions();
    expect(reactions.length).toBe(1);
    expect(reactions[0]).toBe(DBasics.actions.ForwardFloorActionId);
});
