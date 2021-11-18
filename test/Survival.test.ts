import { TestEnv } from "./TestEnv";
import { REBasics } from "ts/re/data/REBasics";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SDebugHelpers } from "ts/re/system/SDebugHelpers";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LProjectableBehavior } from "ts/re/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/re/system/SEffectContext";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Survival.FP", () => {
    TestEnv.newGame();

    // Player
    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    expect(player1.actualParam(REBasics.params.fp)).toBe(10000); // 初期 FP は 10000
    
    //----------------------------------------------------------------------------------------------------
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.actualParam(REBasics.params.fp)).toBe(10000); // Dialog 開いた状態なので未行動。FP消費はされていない。

    const dialogContext = RESystem.dialogContext;

    //----------------------------------------------------------------------------------------------------
    // 移動で FP が減少するか？

    dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.actualParam(REBasics.params.fp)).toBe(9990);  // FP が減少していること

    const prevHP = player1.actualParam(REBasics.params.hp);

    //----------------------------------------------------------------------------------------------------
    // FP 0 にしてから移動してみる

    SDebugHelpers.setFP(player1, 0);
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(player1.actualParam(REBasics.params.hp)).toBe(prevHP - 1);   // HP が減少していること

    //----------------------------------------------------------------------------------------------------

    // UT薬草をインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // [食べる]
    const activity = LActivity.makeEat(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(player1.actualParam(REBasics.params.fp)).toBe(4);  // 草を食べた分だけ FP が回復していること
    // NOTE: 原作では、食料を食べた直後、9回移動すると満腹度が1減る。
    // つまり、1ターン内で食べた直後に満腹度の減算が発生している。

    //----------------------------------------------------------------------------------------------------
    // 投げ当てたときは FP は回復しない
    
    // UT薬草を Player の右に置く
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item2._name = "item2";
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, player1.x + 2, player1.y);
    
    // UT薬草を Player へ向かって吹き飛ばす
    const subject = new SEffectSubject(player1); // 適当に
    LProjectableBehavior.startMoveAsProjectile(RESystem.commandContext, item2, subject, 4, 5);

    // Player は何もしない (FP は 1 減る)
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(REGame.world.findEntity(item2.entityId())).toBe(undefined);  // UT薬草は Player と衝突したので消滅している
    expect(player1.actualParam(REBasics.params.fp)).toBe(3);            // 投げ当てたときの効果は発動するが、FP は回復しない
});
