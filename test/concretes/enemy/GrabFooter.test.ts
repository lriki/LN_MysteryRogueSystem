import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { DBasics } from "ts/re/data/DBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.GrabFooter", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    const hp1 = actor1.actualParam(DBasics.params.hp);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ミニゴーレム").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const hp2 = actor1.actualParam(DBasics.params.hp);
    expect(actor1.x).toBe(11);      // 移動できている
    expect(hp2 < hp1).toBe(true);   // 攻撃を受けている

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const hp3 = actor1.actualParam(DBasics.params.hp);
    expect(actor1.x).toBe(11);      // 移動できない (キャンセルされる)
    expect(hp3 < hp2).toBe(true);   // モンスターにターンが回り、攻撃を受けている

});
