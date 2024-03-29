import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import "./Extension";
import "../ts/mr/lively/Extensions";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { STransferMapDialog } from "ts/mr/system/dialogs/STransferMapDialog";

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
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);  // 配置
    SDebugHelpers.setHP(enemy1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 右を向いて攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.isDestroyed()).toBeTruthy();    // 攻撃がヒットし、倒されていること。
});

test("Combat.DamageAndGameover", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 5, 5);
    SDebugHelpers.setHP(actor1, 1); // HP1 にして攻撃が当たったら倒れるようにする

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    TestEnv.transferEntity(enemy1, floorId, 3, 5);  // 配置

    // Player 入力待ちまで進める
    MRSystem.scheduler.stepSimulation();
    
    // Player を左へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 4).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    // Enemy の目の前に移動してしまったので、攻撃される。→ 倒される
    // onTurnEnd 時までに戦闘不能が回復されなければゲームオーバーとなり、
    // Land.exitRMMZMapId に設定されているマップへの遷移が発生する。
    MRSystem.scheduler.stepSimulation();

    // 戦闘不能で遷移中。コアスクリプト側で遷移処理が必要
    expect(actor1.isDeathStateAffected()).toBeTruthy();
    expect(STransferMapDialog.isFloorTransfering).toBeTruthy();
});
