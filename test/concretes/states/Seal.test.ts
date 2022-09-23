import { assert } from "ts/mr/Common";
import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.Seal.Skill", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const pow1 = player1.actualParam(MRBasics.params.pow);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ゾンビ_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_System_Seal").id);
    enemy1.addState(MRData.getState("kState_UT10ダメージ").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 100; i++) {
        // HPを戻しておく
        player1.setActualParam(MRBasics.params.hp, hp1);

        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // スキルは発動できないので、ちからは減っていない
        const pow2 = player1.actualParam(MRBasics.params.pow);
        expect(pow2).toBe(pow1);
    }
});

