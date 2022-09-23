import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Parameters.pow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_Test_サンドバッグドラゴン").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 通常状態でダメージを出してみる

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    
    //----------------------------------------------------------------------------------------------------
    // ちからを上げてダメージを出してみる

    player1.params().param(MRBasics.params.pow)?.setIdealParamPlus(16);
    expect(player1.actualParam(MRBasics.params.pow)).toBe(24);  // 最大値上昇に伴い、ちからが上昇する

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const enemy1HP3 = enemy1.actualParam(MRBasics.params.hp);

    const damage1 = enemy1HP1 - enemy1HP2;
    const damage2 = enemy1HP2 - enemy1HP3;
    expect(damage1).toBeLessThan(damage2);  // ダメージが必ず増えている
});
