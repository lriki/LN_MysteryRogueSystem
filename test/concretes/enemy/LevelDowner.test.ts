import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { MRBasics } from "ts/re/data/MRBasics";
import { TestEnv } from "test/TestEnv";
import { LExperienceBehavior } from "ts/re/objects/behaviors/LExperienceBehavior";

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
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ミステリーインプA").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_UTからぶり").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 4);

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const message = REGame.messageHistory;
    for (let i = 0; i < 50; i++) {
        player1.setActualParam(MRBasics.params.hp, hp1);
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        message.clear();
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

        // レベルが下がったタイミングで、メッセージが出ているかチェックする
        if (experience.level(player1) < 99) {
            expect(message.includesText("レベルが下がった")).toBeTruthy();
            expect(message.includesText("効かなかった")).toBeFalsy();
            break;
        }
    }

    expect(experience.level(player1) < 99).toBe(true);
});

