import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
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
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_バネ_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // ワープしている
    if (player1.mx != 11 && player1.my != 10) {
        console.log("pos: ", player1.mx, player1.my);
    }
    expect(player1.mx == 11 && player1.my == 10).toBeFalsy();
    expect(REGame.messageHistory.includesText("効かなかった")).toBeFalsy(); // 余計なメッセージが出ていなこと
});
