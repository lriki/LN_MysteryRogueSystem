import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.GrabFooter", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    const hp1 = actor1.getActualParam(MRBasics.params.hp);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_バインドゴーレムA").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);       // 攻撃必中にする
    enemy1.addState(MRData.getState("kState_UT10ダメージ").id);
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const hp2 = actor1.getActualParam(MRBasics.params.hp);
    expect(actor1.mx).toBe(11);      // 移動できている
    expect(hp2 < hp1).toBe(true);   // 攻撃を受けている

    // 下へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const hp3 = actor1.getActualParam(MRBasics.params.hp);
    expect(actor1.my).toBe(10);      // 移動できない (キャンセルされる)
    expect(hp3 < hp2).toBe(true);   // モンスターにターンが回り、攻撃を受けている

});
