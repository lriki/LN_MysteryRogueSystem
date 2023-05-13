import { TestEnv } from "../TestEnv";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LBlock, LTileShape } from "ts/mr/lively/LBlock";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { assert } from "ts/mr/Common";
import { UMovement } from "ts/mr/utility/UMovement";
import { HDimension } from "ts/mr/lively/helpers/HDimension";
import { LEntity } from "ts/mr/lively/entity/LEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

function addPlayerPartyMember(entityKey: string): LEntity {
    const player1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    const party1 = player1.party();
    const follower1 = MRLively.system.uniqueActorUnits.find(unit => unit.data.entity.key == entityKey);
    assert(follower1);
    party1?.addMember(follower1);
    return follower1;
}

test("system.Follower.Locate", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // まず最初に Party へメンバー(ActorB) を追加する 
    const follower1 = addPlayerPartyMember("kEntity_ActorB");

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);   // ここで Player のマップ移動と共に、

    // 仲間は Player のすぐ近くに登場しているはず。
    expect(follower1.floorId.equals(floorId)).toBeTruthy();
    expect(HDimension.getMoveDistanceEntites(follower1, player1)).toBe(1);
});

test("system.Follower.AI.Moving1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const follower1 = addPlayerPartyMember("kEntity_ActorB");

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    MRLively.world.transferEntity(follower1, floorId, 12, 10);  // follower1 は Player の右隣へ

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //--------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 仲間は視界にモンスターが居ても突撃せず、 Player に向かって移動する。
    expect(follower1.mx).toBe(11);
    expect(follower1.my).toBe(10);

    //--------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 仲間は Player の隣のまま。
    expect(follower1.mx).toBe(11);
    expect(follower1.my).toBe(10);
});

test("system.Follower.AI.Attack1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const follower1 = addPlayerPartyMember("kEntity_ActorB");

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    MRLively.world.transferEntity(follower1, floorId, 11, 10);  // follower1 は Player の右隣へ

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 12, 10);
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);

    follower1.addState(TestEnv.StateId_CertainDirectAttack);

    const follower1HP1 = follower1.getActualParam(MRBasics.params.hp);
    const enemy1HP1 = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //--------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 仲間とモンスターは隣接している互いに攻撃しあう。
    const follower1HP2 = follower1.getActualParam(MRBasics.params.hp);
    const enemy1HP2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(follower1HP2).toBeLessThan(follower1HP1);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);
});
