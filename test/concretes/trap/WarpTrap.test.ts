import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DBlockLayerKind } from "ts/mr/data/DCommon";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.WarpTrap.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_バネA").id, [], "trap1"));
    MRLively.world.transferEntity(undefined, trap1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // ワープしている
    if (player1.mx != 11 && player1.my != 10) {
        console.log("pos: ", player1.mx, player1.my);
    }
    expect(player1.mx == 11 && player1.my == 10).toBeFalsy();
    expect(MRLively.messageHistory.includesText("効かなかった")).toBeFalsy(); // 余計なメッセージが出ていなこと
});
