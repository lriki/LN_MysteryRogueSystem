import { TestEnv } from "../TestEnv";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Follower.basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    const party1 = player1.party();

    const follower1 = MRLively.system.uniqueActorUnits.find(unit => unit.data.entity.key == "kEntity_ActorB");
    party1?.addMember(follower1!);

    // Player
    TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_Sleep);
    player1.setParamCurrentValue(MRBasics.params.hp, 1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 10);
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const result = player1._deathResult;
    expect(result.states().includes(TestEnv.StateId_Sleep)).toBe(true);
    expect(player1.isDeathStateAffected()).toBe(true);
});
