import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { assert } from "ts/mr/Common";
import { DBuffLevelOp, DBuffMode, DBuffType, DParamBuff, LStateLevelType } from "ts/mr/data/DEffect";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LGenericRMMZStateBehavior } from "ts/mr/lively/states/LGenericRMMZStateBehavior";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { LScheduler2 } from "ts/mr/lively/LScheduler";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.速度変化", () => {
    TestEnv.newGame();
    //const stateId = REData.getStateFuzzy("kState_UT速度バフ").id;
    const buff1: DParamBuff = {
        paramId: MRBasics.params.agi,
        level: 1,
        levelType: DBuffLevelOp.Add,
        type: DBuffType.Add,
        turn: 10,
    };
    const buff2: DParamBuff = {
        paramId: MRBasics.params.agi,
        level: -1,
        levelType: DBuffLevelOp.Set,
        type: DBuffType.Add,
        turn: 10,
    };

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // デフォルトの行動回数は 1 (等速)
    expect(LScheduler2.getSpeedLevel(actor1)).toBe(1);

    // 倍速化
    actor1.addBuff(buff1);
    const param = actor1.params.param(MRBasics.params.agi);
    assert(param);
    expect(param.getConstantBuff().level).toBe(1);
    expect(LScheduler2.getSpeedLevel(actor1)).toBe(2);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT倍速").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT3倍速").id)).toBe(false);

    // 3倍速化
    actor1.addBuff(buff1);
    expect(param.getConstantBuff().level).toBe(2);
    expect(LScheduler2.getSpeedLevel(actor1)).toBe(3);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT3倍速").id)).toBe(true);
    
    // 鈍足化
    actor1.addBuff(buff2);
    expect(param.getConstantBuff().level).toBe(-1);
    expect(LScheduler2.getSpeedLevel(actor1)).toBe(-1);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT鈍足").id)).toBe(true);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT3倍速").id)).toBe(false);

    // 解除
    actor1.removeBuff(MRBasics.params.agi);
    expect(LScheduler2.getSpeedLevel(actor1)).toBe(1);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT鈍足").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT倍速").id)).toBe(false);
    expect(!!actor1.states().find(x => x.stateDataId() == MRData.getState("kState_UT3倍速").id)).toBe(false);

    MRSystem.scheduler.stepSimulation();
});

test("concretes.states.速度変化.remove", () => {
    TestEnv.newGame();
    const buff1: DParamBuff = {
        paramId: MRBasics.params.agi,
        level: 1,
        levelType: DBuffLevelOp.Add,
        type: DBuffType.Add,
        turn: 10,
    };

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.addBuff(buff1);
    const param = actor1.params.param(MRBasics.params.agi);
    assert(param);

    // 10 ターン分 シミュレーション実行
    MRSystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // 10 ターンの間はステートが追加されている
        expect(param.getConstantBuff().level > 0).toBe(true);

        // 待機
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();
    }

    // 10 ターンで解除
    expect(param.getConstantBuff().level == 0).toBe(true);
});


test("concretes.states.速度変化.Issue1", () => {
    TestEnv.newGame();
    const buff1: DParamBuff = {
        paramId: MRBasics.params.agi,
        level: 1,
        levelType: DBuffLevelOp.Add,
        type: DBuffType.Add,
        turn: 10,
    };

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    //actor1.addBuff(buff1);
    //const param = actor1.params().param(DBasics.params.agi);
    //assert(param);
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_すばやさ草_A").id, [], "item1"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 30, 10);

    const wait = () => {
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
    }

    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    //----------
    // Round
    expect(enemy1.mx).toBe(30);
    MRSystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    expect(enemy1.mx).toBe(30);
    const buf = actor1.params.params()[MRBasics.params.agi];
    assert(buf);
    buf.getConstantBuff().turn = 2;  // テスト用に残りターン数調整。あと2回ManualAction取ると通常速度に戻るイメージ。
    wait();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    //----------
    // Round
    expect(enemy1.mx).toBe(29);
    wait();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    // ↑この中で速度変化は解除される

    expect(enemy1.mx).toBe(28);
    wait();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------


    /*
    NOTE: シレン5ではシレンがすばやさ草を飲んだ後、13回歩くと「速度が元に戻った」メッセージがでる。
    「戻った」と表示された直後１ターン、動くことができる。
    草を飲んだあと、２回行動すると等速モンスターも動く。

    */
});