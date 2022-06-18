import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.LegHoldTrap.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_トラバサミ_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(player1.isStateAffected(MRData.getState("kState_UTトラバサミ").id)).toBe(true);
        expect(player1.mx).toBe(11);      // 移動できない (キャンセルされる)

        // player を右 (罠上) へ移動
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }
    
    // ステート解除判定のタイミングの都合で、解除されるターンは移動がキャンセルされる
    expect(player1.isStateAffected(MRData.getState("kState_UTトラバサミ").id)).toBe(false);
    expect(player1.mx).toBe(11);      // ステート解除。移動できる。
    
    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.mx).toBe(12);      // 移動できる。
});
