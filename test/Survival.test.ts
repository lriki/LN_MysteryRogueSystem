import { TestEnv } from "./TestEnv";
import { DBasics } from "ts/data/DBasics";
import { LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { DialogSubmitMode } from "ts/system/SDialog";
import { SGameManager } from "ts/system/SGameManager";
import { SDebugHelpers } from "ts/system/SDebugHelpers";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/system/SEffectContext";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Survival.FP", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    expect(actor1.actualParam(DBasics.params.fp)).toBe(1000); // 初期 FP は 1000
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(actor1.actualParam(DBasics.params.fp)).toBe(1000); // Dialog 開いた状態なので未行動。FP消費はされていない。

    const dialogContext = RESystem.dialogContext;

    //--------------------
    // 移動で FP が減少するか？

    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(actor1.actualParam(DBasics.params.fp)).toBe(999);  // FP が減少していること

    const prevHP = actor1.actualParam(DBasics.params.hp);

    //--------------------
    // FP 0 にしてから移動してみる

    SDebugHelpers.setFP(actor1, 0);
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(actor1.actualParam(DBasics.params.hp)).toBe(prevHP - 1);   // HP が減少していること

    
    //--------------------

    // UT薬草をインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    actor1.getBehavior(LInventoryBehavior).addEntity(item1);

    // [食べる]
    const activity = LActivity.makeEat(actor1, item1);
    RESystem.dialogContext.postActivity(activity);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(actor1.actualParam(DBasics.params.fp)).toBe(5);  // 草を食べた分だけ FP が回復していること


    //--------------------
    // 投げ当てたときは FP は回復しない
    
    // UT薬草を Player の右に置く
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Herb));
    item2._name = "item2";
    REGame.world._transferEntity(item2, TestEnv.FloorId_FlatMap50x50, actor1.x + 2, actor1.y);
    
    // UT薬草を Player へ向かって吹き飛ばす
    const subject = new SEffectSubject(actor1); // 適当に
    LProjectableBehavior.startMoveAsProjectile(RESystem.commandContext, item2, subject, 4, 5);

    // Player は何もしない (FP は 1 減る)
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(REGame.world.findEntity(item2.entityId())).toBe(undefined);  // UT薬草は Player と衝突したので消滅している
    expect(actor1.actualParam(DBasics.params.fp)).toBe(4);            // 投げ当てたときの効果は発動するが、FP は回復しない
});
