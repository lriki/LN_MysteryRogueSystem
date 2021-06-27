import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { DialogSubmitMode } from "ts/system/SDialog";
import { LEntityDivisionBehavior } from "ts/objects/abilities/LEntityDivisionBehavior";
import { REData } from "ts/data/REData";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LActorBehavior } from "ts/objects/behaviors/LActorBehavior";
import { DEntitySpawner } from "ts/data/DEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Abilities.Enemy.ItemImitator", () => {
    SGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const initialHP = actor1.getBehavior(LActorBehavior).actualParam(DBasics.params.hp);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntitySpawner.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UTアイテム擬態").id]));
    enemy1._name = "enemy1";
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // Enemy の上に移動してみる
    RESystem.dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 移動は失敗している
    expect(actor1.x).toBe(10);
    
    const hp = actor1.getBehavior(LActorBehavior).actualParam(DBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});
