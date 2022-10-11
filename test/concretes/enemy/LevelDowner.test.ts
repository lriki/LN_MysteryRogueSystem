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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.LevelDowner", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    const experience = player1.getEntityBehavior(LExperienceBehavior);
    experience.setLevel(player1, 99);
    const hp1 = player1.actualParam(MRBasics.params.hp);

    // Enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_くねくねインプ_A").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    MRLively.world.transferEntity(enemy1, floorId, 11, 4);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const message = MRLively.messageHistory;
    for (let i = 0; i < 50; i++) {
        player1.setActualParam(MRBasics.params.hp, hp1);
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

    expect(experience.level(player1) < 99).toBe(true);
});

