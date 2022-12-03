import { assert } from "ts/mr/Common";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
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

    const idealplus1 = player1.getEffortValue(MRBasics.params.level);    // Level は IdealPlus として扱うことにしたので、そのテスト
    const level1 = player1.getActualParam(MRBasics.params.level);
    expect(level1).toBeGreaterThanOrEqual(1);
    expect(idealplus1).toBe(level1);

    player1.setParamCurrentValue(MRBasics.params.exp, nextExp - 1);   // あと 1 で次のレベルになるようにしておく
    player1.addState(TestEnv.StateId_CertainDirectAttack);      // 攻撃必中にする
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);               // 1 ダメージで倒せるようにしておく
    MRLively.world.transferEntity(undefined, enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 右を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // レベルアップしていることを確認
    const level2 = player1.getActualParam(MRBasics.params.level);
    expect(level2).toBeGreaterThan(level1);

    const message = MRLively.messageHistory;
    expect(message.countIncludesText("はレベル 2 に上がった")).toBe(1);
});

test("system.Leveling.BoundaryValueTest", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);

    player1.setEffortValue(MRBasics.params.level, -1);
    const level1 = player1.getActualParam(MRBasics.params.level);
    expect(level1).toBe(1);

    player1.setEffortValue(MRBasics.params.level, 0);
    const level2 = player1.getActualParam(MRBasics.params.level);
    expect(level2).toBe(1);
    
    player1.setEffortValue(MRBasics.params.level, 1);
    const level3 = player1.getActualParam(MRBasics.params.level);
    expect(level3).toBe(1);
    
    player1.setEffortValue(MRBasics.params.level, 2);
    const level4 = player1.getActualParam(MRBasics.params.level);
    expect(level4).toBe(2);

    player1.setEffortValue(MRBasics.params.level, 99);
    const level5 = player1.getActualParam(MRBasics.params.level);
    expect(level5).toBe(99);

    player1.setEffortValue(MRBasics.params.level, 100);
    const level6 = player1.getActualParam(MRBasics.params.level);
    expect(level6).toBe(99);
});

test("system.Leveling.NoDeadFromSideEffects", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);

    // Level max.
    player1.setEffortValue(MRBasics.params.level, 99);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    player1.gainActualParam(MRBasics.params.hp, -(hp1 - 1), true);
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp2).toBe(1);

    // HP 1 にしてから Level down.
    // ダメージによるHP最大値の減少では無い限り、HPは1残り、戦闘不能にはならない。
    player1.setEffortValue(MRBasics.params.level, 1);
    const hp3 = player1.getActualParam(MRBasics.params.hp);
    expect(hp3).toBe(1);
    expect(player1.isDeathStateAffected()).toBe(false);
});
