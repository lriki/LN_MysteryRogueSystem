import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Abilities.Enemy.Flock", () => {
    TestEnv.newGame();

    const floor = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_UT軍隊ウルフ(ランダム)");

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = REGame.map.entities();
    const enemy1 = entites.find(x => x.data.entity.key == "kEnemy_軍隊ウルフ_A");
    expect(enemy1 != undefined).toBe(true);
});
