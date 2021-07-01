import { REGame } from "ts/objects/REGame";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { LFloorId } from "ts/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Abilities.Enemy.Flock", () => {
    SGameManager.createGameObjects();

    const floor = LFloorId.makeFromKeys("RE-Land:UnitTestDungeon1", "kFloor_UTフロックウルフ(ランダム)");

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, floor, 0, 0);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = REGame.map.entities();
    const enemy1 = entites.find(x => x.data().entity.key == "kEnemy_フロックウルフ");
    expect(enemy1 != undefined).toBe(true);
});
