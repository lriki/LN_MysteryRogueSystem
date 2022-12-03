import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { TestEnv } from "test/TestEnv";
import { LExperienceBehavior } from "ts/mr/lively/behaviors/LExperienceBehavior";
import { LDecisionBehavior } from "ts/mr/lively/behaviors/LDecisionBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.LevelDowner.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const experience = player1.getEntityBehavior(LExperienceBehavior);
    experience.setLevel(player1, 99);
    expect(player1.getActualParam(MRBasics.params.level)).toBe(99);
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_くねくねインプA").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    MRLively.world.transferEntity(undefined, enemy1, floorId, 11, 4);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const message = MRLively.messageHistory;
    for (let i = 0; i < 50; i++) {
        player1.setParamCurrentValue(MRBasics.params.hp, hp1);
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        message.clear();
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // レベルが下がったタイミングで、メッセージが出ているかチェックする
        if (experience.level(player1) < 99) {
            expect(message.includesText("レベルが下がった")).toBeTruthy();
            expect(message.includesText("効かなかった")).toBeFalsy();
            break;
        }
    }

    const level1 = experience.level(player1);
    expect(level1).toBeLessThan(99);
});

test("concretes.enemy.LevelDowner.RemainingExpAtLevelDown", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const experience = player1.getEntityBehavior(LExperienceBehavior);
    experience.setLevel(player1, 99);
    expect(player1.getActualParam(MRBasics.params.level)).toBe(99);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_くねくねインプA").id, [], "enemy1"));
    enemy1.dir = 4;
    MRLively.world.transferEntity(undefined, enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // Player - [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    // Enemy - [スキル]
    const skill1 = MRData.getSkill("kSkill_レベルダウン");
    const activity1 = LActivity.makePerformSkill(enemy1, skill1.id, 4).withConsumeAction();
    enemy1.getEntityBehavior(LDecisionBehavior).forceMajorActivity = activity1;

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------
    
    // レベルダウンし、Exp は次のレベルまでの -1 になっている。
    const level1 = experience.level(player1);
    const exp1 = experience.currentExp(player1);
    const exp2 = experience.nextLevelExp(player1);
    expect(level1).toBeLessThan(99);
    expect(exp1).toBe(exp2 - 1);
});

