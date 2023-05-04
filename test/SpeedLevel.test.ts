import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { assert } from "ts/mr/Common";
import { SMotionSequel } from "ts/mr/system/SSequel";
import { LGenericRMMZStateBehavior } from "ts/mr/lively/states/LGenericRMMZStateBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("SpeedLevel.TurnOrderTable", () => {
    TestEnv.newGame();

    // actor1 - x1 速
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 1, 5); 
    actor1.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(1);

    // enemy1 - x1 速
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(1);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 1, 6);

    // enemy2 - x1 速
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy2"));
    enemy2.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(1);
    enemy2.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy2, TestEnv.FloorId_FlatMap50x50, 1, 7);

    // enemy3 - x2 速
    const enemy3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy3"));
    enemy3.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(2);
    enemy3.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy3, TestEnv.FloorId_FlatMap50x50, 1, 8);

    // enemy4 - x2 速
    const enemy4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy4"));
    enemy4.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(2);
    enemy4.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy4, TestEnv.FloorId_FlatMap50x50, 1, 9);

    // enemy5 - x3 速
    const enemy5 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy5"));
    enemy5.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(3);
    enemy5.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy5, TestEnv.FloorId_FlatMap50x50, 1, 10);

    // enemy6 - x3 速
    const enemy6 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy6"));
    enemy6.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(3);
    enemy6.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy6, TestEnv.FloorId_FlatMap50x50, 1, 11);

    // enemy7 - x0.5 速
    const enemy7 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy7"));
    enemy7.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(-1);
    enemy7.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy7, TestEnv.FloorId_FlatMap50x50, 1, 12);

    // enemy8 - x0.5 速
    const enemy8 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy8"));
    enemy8.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(-1);
    enemy8.addState(TestEnv.StateId_debug_MoveRight);
    TestEnv.transferEntity(enemy8, TestEnv.FloorId_FlatMap50x50, 1, 13);

    MRSystem.scheduler.stepSimulation();

    //--------------------
    // 最初の行動予定順をチェック
    /*
    {
        const runs = REGame.scheduler.actionScheduleTable();
        expect(runs.length).toBe(3);    // map 上の Entity のうち最大速度はx3なので、Run は3つ。

        const run0 = runs[0].steps;
        expect(run0.length).toBe(5);
        expect(REGame.world.entity(run0[0].unit().entityId())).toEqual(actor1);  // 先頭は Player
        expect(run0[0].iterationCountMax()).toEqual(1);
        expect(REGame.world.entity(run0[1].unit().entityId())).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run0[1].iterationCountMax()).toEqual(2);
        expect(REGame.world.entity(run0[2].unit().entityId())).toEqual(enemy4);
        expect(run0[2].iterationCountMax()).toEqual(2);
        expect(REGame.world.entity(run0[3].unit().entityId())).toEqual(enemy5);
        expect(run0[3].iterationCountMax()).toEqual(3);
        expect(REGame.world.entity(run0[4].unit().entityId())).toEqual(enemy6);
        expect(run0[4].iterationCountMax()).toEqual(3);

        const run1 = runs[1].steps;
        expect(run1.length).toBe(4);
        expect(REGame.world.entity(run1[0].unit().entityId())).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run1[0].iterationCountMax()).toEqual(0);
        expect(REGame.world.entity(run1[1].unit().entityId())).toEqual(enemy4);
        expect(run1[1].iterationCountMax()).toEqual(0);
        expect(REGame.world.entity(run1[2].unit().entityId())).toEqual(enemy5);
        expect(run1[2].iterationCountMax()).toEqual(0);
        expect(REGame.world.entity(run1[3].unit().entityId())).toEqual(enemy6);
        expect(run1[3].iterationCountMax()).toEqual(0);

        // 最後の Run には、x2速以上の余りと、x1速以下の Entity が積まれている
        const run2 = runs[2].steps;
        expect(run2.length).toBe(6);
        expect(REGame.world.entity(run2[0].unit().entityId())).toEqual(enemy5);  // x3 優先
        expect(run2[0].iterationCountMax()).toEqual(0);
        expect(REGame.world.entity(run2[1].unit().entityId())).toEqual(enemy6);  // x3 優先
        expect(run2[1].iterationCountMax()).toEqual(0);
        expect(REGame.world.entity(run2[2].unit().entityId())).toEqual(enemy1);  // x1
        expect(run2[2].iterationCountMax()).toEqual(1);
        expect(REGame.world.entity(run2[3].unit().entityId())).toEqual(enemy2);  // x1
        expect(run2[3].iterationCountMax()).toEqual(1);
        expect(REGame.world.entity(run2[4].unit().entityId())).toEqual(enemy7);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
        expect(run2[4].iterationCountMax()).toEqual(1);
        expect(REGame.world.entity(run2[5].unit().entityId())).toEqual(enemy8);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
        expect(run2[5].iterationCountMax()).toEqual(1);
    }
    */

    const dialogContext = MRSystem.dialogContext;
    
    //--------------------
    // 移動量から実際に行動した数を判断する
    {
        // player を右へ移動
        dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
        dialogContext.activeDialog().submit();
        const count1 = TestEnv.integration.sequelFlushCount;
    
        // AI行動決定
        MRSystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.mx).toBe(2);
        expect(enemy1.mx).toBe(2);
        expect(enemy2.mx).toBe(2);
        expect(enemy3.mx).toBe(3);
        expect(enemy4.mx).toBe(3);
        expect(enemy5.mx).toBe(4);
        expect(enemy6.mx).toBe(4);
        expect(enemy7.mx).toBe(1);   // 鈍足状態 (になった直後のターン) は行動しない
        expect(enemy8.mx).toBe(1);   // 鈍足状態 (になった直後のターン) は行動しない

        // Sequel はまとめて1度だけFlush
        expect(TestEnv.integration.sequelFlushCount).toBe(count1 + 1);
    }

    //--------------------
    // 2ターン目
    {
        // player を右へ移動
        dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
        dialogContext.activeDialog().submit();
    
        // AI行動決定
        MRSystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.mx).toBe(3);
        expect(enemy1.mx).toBe(3);
        expect(enemy2.mx).toBe(3);
        expect(enemy3.mx).toBe(5);
        expect(enemy4.mx).toBe(5);
        expect(enemy5.mx).toBe(7);
        expect(enemy6.mx).toBe(7);
        expect(enemy7.mx).toBe(2);
        expect(enemy8.mx).toBe(2);
    }

});

/*
test("EntitySaveLoad", () => {
    let contentsString = "";

    // Save
    {
        const actor1 = new LEntity();

        // Entity Property
        actor1._setObjectId(new LEntityId(1, 111));
        actor1.x = 55;

        // Attributes
        const a1 = RESystem.createAttribute(RESystem.attributes.unit) as LUnitAttribute;
        a1.setSpeedLevel(2);
        actor1.addAttribute(a1);

        // Behaviors
        actor1.addBehavior(REUnitBehavior);

        const contents1 = actor1.makeSaveContents();
        contentsString = JSON.stringify(contents1);
    }

    // Load
    {
        const actor2 = new LEntity();
        const contents2 = JSON.parse(contentsString);
        actor2.extractSaveContents(contents2);
        
        // Entity Property
        expect(actor2.entityId().index2()).toBe(1);
        expect(actor2.entityId().key2()).toBe(111);
        expect(actor2.x).toBe(55);

        // Attributes
        const a1 = actor2.findBehavior(REUnitBehavior);
        expect(actor2.attrbutes.length).toBe(1);
        expect(a1).toBeDefined();
        expect(a1?.speedLevel()).toBe(2);

        // Behaviors
        expect(actor2.basicBehaviors().length).toBe(1);
        expect(actor2.basicBehaviors()[0]).toBeInstanceOf(REUnitBehavior);
    }
});

*/

test("SpeedLevel.Sequel", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // actor1 - x1 速
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10); 
    actor1.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(1);

    // enemy1 - x2 速
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(2);
    TestEnv.transferEntity(enemy1, floorId, 15, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // enemy は 2回行動し、2つめは relatedSequels が積まれている
    const s = TestEnv.activeSequelSet;
    expect(s.runs().length).toBe(1);
    expect(s.runs()[0].clips().length).toBe(1);
    const sequels = s.runs()[0].clips()[0].sequels();
    expect(sequels.length).toBe(1);
    expect((sequels[0] as SMotionSequel).sequelId()).toBe(2);
    expect((sequels[0] as SMotionSequel).relatedSequels().length).toBe(1);
    expect((sequels[0] as SMotionSequel).relatedSequels()[0].sequelId()).toBe(2);
});

// Player が速くなる場合
test("SpeedLevel.ChangeSpeed1", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(10);  // まだ enemy にターンは回らないので移動していない

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(11);  // enemy にターンは回って移動してる
});

// Enemy が速くなる場合 -> Player の後に Enemy が2回行動
test("SpeedLevel.ChangeSpeed2", () => {
    TestEnv.newGame();

    // Players
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草A").id, [], "item3"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.addState(MRData.getState("kState_UnitTest_投擲必中").id);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    //enemy1.getBehavior(LUnitBehavior).setSpeedLevel(2);
    //RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    //RESystem.dialogContext.activeDialog().submit();
    
    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(actor1, item1).withEntityDirection(2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(12);

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(14);
});

// 倍速 Enemy がいるときに Player が倍速になる
//   -> Player がすばやさ草を飲んだ直後は Enemy が行動する
test("SpeedLevel.ChangeSpeed3", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2); // 倍速化

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 倍速化して [待機]
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(11);  // Enemy に 1度だけ turn がまわる
});

test("SpeedLevel.ChangeSpeed4", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.getEntityBehavior(LUnitBehavior).setSpeedLevel(3);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(11);  // Enemy に 1度だけ turn がまわる
});

test("SpeedLevel.ChangeSpeed5", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 11);
    enemy1.addState(TestEnv.StateId_debug_MoveRight);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy を鈍足化して [待機]
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(-1);
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(10);  // 速度ダウンを検知したときに行動トークンが削られるので、Enemy に Turn はまわらない
});

test("SpeedLevel.State", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UT混乱").id;

    // actor1 - x1 速
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 1, 5); 
    actor1.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(1);

    // enemy2 - x2 速
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy2"));
    enemy2.findEntityBehavior(LUnitBehavior)?.setSpeedLevel(2);
    enemy2.addState(TestEnv.StateId_debug_MoveRight);
    enemy2.addState(stateId);
    TestEnv.transferEntity(enemy2, TestEnv.FloorId_FlatMap50x50, 1, 7);
    const state = enemy2.findState(stateId);
    const behavior = state?.stateBehabiors().find(b => b instanceof LGenericRMMZStateBehavior) as LGenericRMMZStateBehavior;
    const turn = behavior._stateTurn;
    assert(turn);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Enemy だけ倍速で動いているとき、ステートがちゃんと 2 ターン分経過していること
    expect(behavior._stateTurn).toBe(turn - 2);
});

