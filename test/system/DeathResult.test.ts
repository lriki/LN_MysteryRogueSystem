import { TestEnv } from "../TestEnv";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.DeathResult.State", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_Sleep);
    player1.setActualParam(MRBasics.params.hp, 1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, floorId, 11, 10);
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const result = player1._deathResult;
    expect(result.states().includes(TestEnv.StateId_Sleep)).toBe(true);
    expect(player1.isDeathStateAffected()).toBe(true);
});
