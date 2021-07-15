import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { LEntityDivisionBehavior } from "ts/objects/abilities/LEntityDivisionBehavior";
import { REData } from "ts/data/REData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Abilities.Enemy.Division", () => {
    TestEnv.newGame();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    enemy1.addBehavior(LEntityDivisionBehavior);
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);


    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 右を向いて攻撃
    actor1.dir = 6;
    RESystem.dialogContext.commandContext().postPerformSkill(actor1, RESystem.skills.normalAttack, undefined);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    const entityCount = REGame.map.entities().length;

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 分裂でエンティティが増えていること
    expect(REGame.map.entities().length).toBe(entityCount + 1);
});
