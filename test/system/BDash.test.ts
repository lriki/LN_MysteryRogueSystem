import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { MRBasics } from "ts/re/data/MRBasics";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.BDash.ArrowDamageStop", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_アローインプA").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_UnitTest_投擲必中").id);    // 投擲必中
    REGame.world.transferEntity(enemy1, floorId, 15, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy の方に向かってダッシュで移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withFastForward().withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    for (let i = 0; i < 10; i++) {
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    const hp2 = player1.actualParam(MRBasics.params.hp);
    const unit = player1.getEntityBehavior(LUnitBehavior);
    expect(hp2).toBeLessThan(hp1);              // ダメージを受けている
    expect(unit._straightDashing).toBeFalsy();  // ダッシュ状態は解除されている
    expect(player1.mx).toBe(11);                 // ダメージを受けたところで止まっている
});
