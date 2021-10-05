import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { assert } from "ts/re/Common";
import { DBuffMode, DBuffOp, DParamBuff, LStateLevelType } from "ts/re/data/DEffect";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REBasics } from "ts/re/data/REBasics";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LGenericRMMZStateBehavior } from "ts/re/objects/states/LGenericRMMZStateBehavior";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.速度変化", () => {
    TestEnv.newGame();
    //const stateId = REData.getStateFuzzy("kState_UT速度バフ").id;
    const buff1: DParamBuff = {
        paramId: REBasics.params.agi,
        mode: DBuffMode.Strength,
        level: 1,
        levelType: LStateLevelType.RelativeValue,
        op: DBuffOp.Add,
        turn: 10,
    };
    const buff2: DParamBuff = {
        paramId: REBasics.params.agi,
        mode: DBuffMode.Strength,
        level: -1,
        levelType: LStateLevelType.AbsoluteValue,
        op: DBuffOp.Add,
        turn: 10,
    };

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // デフォルトの行動回数は 1 (等速)
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(1);

    // 倍速化
    actor1.addBuff(buff1);
    const param = actor1.params().param(REBasics.params.agi);
    assert(param);
    expect(param.getAddBuff().level).toBe(1);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(2);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    // 3倍速化
    actor1.addBuff(buff1);
    expect(param.getAddBuff().level).toBe(2);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(3);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(true);
    
    // 鈍足化
    actor1.addBuff(buff2);
    expect(param.getAddBuff().level).toBe(-1);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(-1);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    // 解除
    actor1.removeBuff(REBasics.params.agi);
    expect(REGame.scheduler.getSpeedLevel(actor1)).toBe(1);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == REData.getStateFuzzy("kState_UT3倍速").id)).toBe(false);

    RESystem.scheduler.stepSimulation();
});

test("concretes.states.速度変化.remove", () => {
    TestEnv.newGame();
    const buff1: DParamBuff = {
        paramId: REBasics.params.agi,
        mode: DBuffMode.Strength,
        level: 1,
        levelType: LStateLevelType.RelativeValue,
        op: DBuffOp.Add,
        turn: 10,
    };

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addBuff(buff1);
    const param = actor1.params().param(REBasics.params.agi);
    assert(param);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(param.getAddBuff().level > 0).toBe(true);

        // 待機
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction(LActionTokenType.Major));
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // 10 ターンで解除
    expect(param.getAddBuff().level == 0).toBe(true);
});


test("concretes.states.速度変化.Issue1", () => {
    TestEnv.newGame();
    const buff1: DParamBuff = {
        paramId: REBasics.params.agi,
        mode: DBuffMode.Strength,
        level: 1,
        levelType: LStateLevelType.RelativeValue,
        op: DBuffOp.Add,
        turn: 10,
    };

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    //actor1.addBuff(buff1);
    //const param = actor1.params().param(DBasics.params.agi);
    //assert(param);
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kItem_スピードドラッグ").id, [], "item1"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 30, 10);

    const wait = () => {
        RESystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction(LActionTokenType.Major));
        RESystem.dialogContext.activeDialog().submit();
    }

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    //----------
    // Round
    expect(enemy1.x).toBe(30);
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(enemy1.x).toBe(30);
    const buf = actor1.params().params()[REBasics.params.agi];
    assert(buf);
    buf.getAddBuff().turn = 2;  // テスト用に残りターン数調整。あと2回ManualAction取ると通常速度に戻るイメージ。
    wait();
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    //----------
    // Round
    expect(enemy1.x).toBe(29);
    wait();
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    // ↑この中で速度変化は解除される

    expect(enemy1.x).toBe(28);
    wait();
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------


    /*
    NOTE: シレン5ではシレンがすばやさ草を飲んだ後、13回歩くと「速度が元に戻った」メッセージがでる。
    「戻った」と表示された直後１ターン、動くことができる。
    草を飲んだあと、２回行動すると等速モンスターも動く。

    */
});