import { assert } from "ts/Common";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LFloorId } from "ts/objects/LFloorId";
import { DBasics } from "ts/data/DBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("ExitPoint.Reactions", () => {
    SGameManager.createGameObjects();

    const floor = LFloorId.makeFromKeys("RE-Land:UnitTestDungeon1", "kFloor_UTドラゴン(ランダム)");

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, floor, 0, 0);
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
