import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.PoisonArrowTrap.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    const pow1 = player1.actualParam(MRBasics.params.pow);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒矢の罠_A").id, [], "trap1"));
    MRLively.world.transferEntity(trap1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.actualParam(MRBasics.params.hp);
    const pow2 = player1.actualParam(MRBasics.params.pow);
    expect(hp2 < hp1).toBe(true);  // ダメージを受けている
    expect(pow2).toBe(pow1 - 1);    // ちからが減っている
});
