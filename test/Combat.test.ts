import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./TestEnv";
import "./Extension";
import "./../ts/re/objects/Extensions";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DEntityCreateInfo } from "ts/re/data/DEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Combat.DamageAndCollapse", () => {

    //--------------------
    // 準備
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);  // 配置

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);  // 配置
    SDebugHelpers.setHP(enemy1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    TestEnv.performFloorTransfer();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 右を向いて攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.isDestroyed()).toBe(true);    // 攻撃がヒットし、倒されていること。
});


test("Combat.DamageAndGameover", () => {

    //--------------------
    // 準備
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);  // 配置
    SDebugHelpers.setHP(actor1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 3, 5);  // 配置

    TestEnv.performFloorTransfer();

    // Player 入力待ちまで進める
    RESystem.scheduler.stepSimulation();
    
    // Player を左へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 4).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    // Enemy の目の前に移動してしまったので、攻撃される。→ 倒される
    // onTurnEnd 時までに戦闘不能が回復されなければゲームオーバーとなり、
    // Land.exitRMMZMapId に設定されているマップへの遷移が発生する。
    RESystem.scheduler.stepSimulation();

    // 遷移中。ツクール側で遷移処理が必要
    expect(REGame.camera.isFloorTransfering()).toBe(true);
});
