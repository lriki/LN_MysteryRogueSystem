import { DBasics } from "ts/data/DBasics";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.ArrowShooter", () => {
    TestEnv.newGame();

    /*
    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_アローインプ").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();
    }
    */
});

