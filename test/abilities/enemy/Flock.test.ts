import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Abilities.Enemy.Flock", () => {
    TestEnv.newGame();

    const floor = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_UT軍隊ウルフ(ランダム)");

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, floor);
    TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // ひとまず、Troop 指定で Spawn 出来ていることを確認する。
    const entites = MRLively.map.entities();
    const enemy1 = entites.find(x => x.data.entity.key == "kEnemy_軍隊ウルフA");
    expect(enemy1 != undefined).toBe(true);
});
