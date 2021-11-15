import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { LFloorId } from "ts/re/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Abilities.Enemy.Flock", () => {
    TestEnv.newGame();

    const floor = LFloorId.makeFromKeys("RE-Land:UnitTestDungeon1", "kFloor_UTフロックウルフ(ランダム)");

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = REGame.map.entities();
    const enemy1 = entites.find(x => x.data().entity.key == "kEnemy_フロックウルフA");
    expect(enemy1 != undefined).toBe(true);
});
