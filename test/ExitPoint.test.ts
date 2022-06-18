import { assert } from "ts/mr/Common";
import { REGame } from "ts/mr/objects/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "./TestEnv";
import { LFloorId } from "ts/mr/objects/LFloorId";
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
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = REGame.map.entities();
    const exitpoint = entites.find(x => x.data.entity.key == "kEntity_ExitPoint_A");
    assert(exitpoint);
    const reactions = exitpoint.queryReactions();
    expect(reactions.length).toBe(1);
    expect(reactions[0]).toBe(MRBasics.actions.ForwardFloorActionId);
});
