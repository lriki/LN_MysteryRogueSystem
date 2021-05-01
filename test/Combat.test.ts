import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";

import "./Extension";
import "./../ts/objects/Extensions";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('DamageAndGameover', () => {

    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // 配置
    SDebugHelpers.setHP(actor1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    //enemy1.addState(RESystem.states.debug_MoveRight);
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 3, 5);  // 配置

    TestEnv.performFloorTransfer();

    // Player 入力待ちまで進める
    RESystem.scheduler.stepSimulation();
    
    // Player を左へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 4));
    dialogContext.closeDialog(true);
    
    // Enemy の目の前に移動してしまったので、攻撃される。→ 倒される
    // onTurnEnd 時までに戦闘不能が回復されなければゲームオーバーとなり、
    // Land.exitRMMZMapId に設定されているマップへの遷移が発生する。
    RESystem.scheduler.stepSimulation();

    // 遷移中。ツクール側で遷移処理が必要
    expect(REGame.camera.isFloorTransfering()).toBe(true);
});

test('Combat.DamageAndCollapse', () => {

    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // 配置

    // enemy1
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);  // 配置
    SDebugHelpers.setHP(enemy1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 右を向いて攻撃
    const dialogContext = RESystem.dialogContext;
    actor1.dir = 6;
    dialogContext.commandContext().postPerformSkill(actor1, RESystem.skills.normalAttack);
    dialogContext.closeDialog(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.isDestroyed()).toBe(true);    // 攻撃がヒットし、倒されていること。
});
