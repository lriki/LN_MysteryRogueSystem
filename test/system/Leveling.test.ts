import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Leveling.levelUp", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const experience1 = player1.getEntityBehavior(LExperienceBehavior);
    const nextExp = experience1.nextLevelExp(player1);
    const level1 = player1.actualParam(MRBasics.params.level);
    player1.setActualParam(MRBasics.params.exp, nextExp - 1);   // あと 1 で次のレベルになるようにしておく
    player1.addState(TestEnv.StateId_CertainDirectAttack);      // 攻撃必中にする
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    enemy1.setActualParam(MRBasics.params.hp, 1);               // 1 ダメージで倒せるようにしておく
    REGame.world.transferEntity(enemy1, floorId, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // レベルアップしていることを確認
    const level2 = player1.actualParam(MRBasics.params.level);
    expect(level2).toBeGreaterThan(level1);

    const message = REGame.messageHistory;
    expect(message.countIncludesText("レベル 2 に上がった")).toBe(1);
});
