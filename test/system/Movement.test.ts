import { assert } from "ts/mr/Common";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity, LDashType } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { HMovement } from "ts/mr/lively/helpers/HMovement";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { SMotionSequel } from "ts/mr/system/SSequel";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});


test("TransformRotationBlock", () => {
    // "左前" を1周変換してみる
    {
        // 回転無し
        let pos = HMovement.transformRotationBlock(-1, -1, 8);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(-1);
    
        pos = HMovement.transformRotationBlock(-1, -1, 9);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(-1);

        pos = HMovement.transformRotationBlock(-1, -1, 6);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-1);

        pos = HMovement.transformRotationBlock(-1, -1, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(0);

        pos = HMovement.transformRotationBlock(-1, -1, 2);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(1);

        pos = HMovement.transformRotationBlock(-1, -1, 1);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(1);

        pos = HMovement.transformRotationBlock(-1, -1, 4);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(1);

        pos = HMovement.transformRotationBlock(-1, -1, 7);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(0);
    }

    // 桂馬の "右前" を1周変換してみる
    {
        // 回転無し
        let pos = HMovement.transformRotationBlock(1, -2, 8);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-2);
    
        pos = HMovement.transformRotationBlock(1, -2, 9);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(-1);

        pos = HMovement.transformRotationBlock(1, -2, 6);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(1);

        pos = HMovement.transformRotationBlock(1, -2, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(2);

        pos = HMovement.transformRotationBlock(1, -2, 2);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(2);

        pos = HMovement.transformRotationBlock(1, -2, 1);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(1);

        pos = HMovement.transformRotationBlock(1, -2, 4);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(-1);

        pos = HMovement.transformRotationBlock(1, -2, 7);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(-2);
    }
});

test("MoveDiagonal_CollideWalls", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer( TestEnv.FloorId_FlatMap50x50, 5, 5);

    // 右下に移動できないような壁を作る
    MRLively.mapView.currentMap.block(6, 5)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(5, 6)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // player を右下へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 3).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // 壁があるので移動できていない
    expect(actor1.mx).toBe(5);
    expect(actor1.my).toBe(5);
});

test("system.Dash.ArrowDamageStop", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_インプA").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UnitTest_投擲必中").id);    // 投擲必中
    TestEnv.transferEntity(enemy1, floorId, 15, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // Enemy の方に向かってダッシュで移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withArgs({type: LDashType.StraightDash}).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    for (let i = 0; i < 10; i++) {
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    const hp2 = player1.getActualParam(MRBasics.params.hp);
    const unit = player1.getEntityBehavior(LUnitBehavior);
    expect(hp2).toBeLessThan(hp1);              // ダメージを受けている
    expect(unit.dashInfo).toBeUndefined();  // ダッシュ状態は解除されている
    expect(player1.mx).toBe(11);                 // ダメージを受けたところで止まっている
});

test("system.Dash.PositionalDash", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // 目標位置にアイテムを置く (到達と同時に拾うはず)
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    TestEnv.transferEntity(item1, floorId, 15, 10);
    
    // Player の右の方に壁を作る
    const block1 = MRLively.mapView.currentMap.block(13, 10);
    block1._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 移動 (壁を隔てて、右に 10 マス移動)
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withArgs({type: LDashType.PositionalDash, targetX: 15, targetY: 10}).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    for (let i = 0; i < 50; i++) {
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // 間違って Block へ侵入したりしていないこと
        expect(block1.containsEntity(player1)).toBeFalsy();
    }

    const points: { x: number, y: number }[] = [
        {x: 11, y: 10},
        {x: 12, y: 11},
        {x: 13, y: 12},
        {x: 14, y: 11},
        {x: 15, y: 10}, // ここで目標位置に到達。最後は斜め移動。
    ];
    const sequelSets = TestEnv.sequelSets;
    for (let i = 0; i < sequelSets.length; i++) {
        const sequelSet = sequelSets[i];
        const seq = sequelSet.runs()[0].clips()[0].sequels()[0];
        assert(seq instanceof SMotionSequel);
        expect(seq.targetX()).toBe(points[i].x);
        expect(seq.targetY()).toBe(points[i].y);
    }

    // 目標位置に到達していること
    expect(player1.mx).toBe(15);
    expect(player1.my).toBe(10);
    
    // アイテムは拾っている
    expect(inventory1.contains(item1)).toBeTruthy();
});


