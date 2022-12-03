import { TestEnv } from "./TestEnv";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SDebugHelpers } from "ts/mr/system/SDebugHelpers";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LProjectileBehavior } from "ts/mr/lively/behaviors/activities/LProjectileBehavior";
import { SEffectSubject } from "ts/mr/system/SEffectContext";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRData } from "ts/mr/data/MRData";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Survival.FP", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    expect(player1.getActualParam(MRBasics.params.fp)).toBe(10000); // 初期 FP は 10000
    
    //----------------------------------------------------------------------------------------------------
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.getActualParam(MRBasics.params.fp)).toBe(10000); // Dialog 開いた状態なので未行動。FP消費はされていない。

    const dialogContext = MRSystem.dialogContext;

    //----------------------------------------------------------------------------------------------------
    // 移動で FP が減少するか？

    dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.getActualParam(MRBasics.params.fp)).toBe(9990);  // FP が減少していること

    const prevHP = player1.getActualParam(MRBasics.params.hp);

    //----------------------------------------------------------------------------------------------------
    // FP 0 にしてから移動してみる

    SDebugHelpers.setFP(player1, 0);
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.getActualParam(MRBasics.params.hp)).toBe(prevHP - 1);   // HP が減少していること

    //----------------------------------------------------------------------------------------------------

    // UT薬草をインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // [食べる]
    const activity = LActivity.makeEat(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(player1.getActualParam(MRBasics.params.fp)).toBe(500);  // 草を食べた分だけ FP が回復していること
    // NOTE: 原作では、食料を食べた直後、9回移動すると満腹度が1減る。
    // つまり、1ターン内で食べた直後に満腹度の減算が発生している。
    // MRシステムでは、アイテム効果の設定時にイメージしづらいマジックナンバーを避けるため、食料を食べた直後には満腹度の減算は発生しない。

    //----------------------------------------------------------------------------------------------------
    // 投げ当てたときは FP は回復しない
    
    // UT薬草を Player の右に置く
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item2._name = "item2";
    TestEnv.transferEntity(item2, TestEnv.FloorId_FlatMap50x50, player1.mx + 2, player1.my);
    
    // UT薬草を Player へ向かって吹き飛ばす
    const subject = new SEffectSubject(player1); // 適当に
    LProjectileBehavior.startMoveAsProjectile(MRSystem.commandContext, item2, subject, 4, 5);

    // Player は何もしない (FP は 1 減る)
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(MRLively.world.findEntity(item2.entityId())).toBe(undefined);  // UT薬草は Player と衝突したので消滅している
    expect(player1.getActualParam(MRBasics.params.fp)).toBe(490);         // 投げ当てたときの効果は発動するが、FP は回復しない (自然経過の消費のみ発生する)
});
