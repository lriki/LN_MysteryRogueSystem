import { TestEnv } from "../TestEnv";
import { REBasics } from "ts/re/data/REBasics";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LTileShape } from "ts/re/objects/LBlock";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.DeathResult.State", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_Sleep);
    player1.setActualParam(REBasics.params.hp, 1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const result = player1._deathResult;
    expect(result.states().includes(TestEnv.StateId_Sleep)).toBe(true);
    expect(player1.isDeathStateAffected()).toBe(true);
});
