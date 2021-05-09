import { REGame } from "ts/objects/REGame";
import { REGameManager } from "ts/system/REGameManager";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { LFloorId } from "ts/objects/LFloorId";
import { SMomementCommon } from "ts/system/SMomementCommon";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { TileShape } from "ts/objects/LBlock";
import { DialogSubmitMode } from "ts/system/REDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

// フロア番号やマップの直接指定による移動
test('MapTransfarDirectly', () => {

    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // 最初に Player を REシステム管理外の 通常マップに配置しておく
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, TestEnv.FloorId_DefaultNormalMap, 5, 5);

    TestEnv.performFloorTransfer();

    // 移動できていること
    expect(REGame.map.floorId().equals(TestEnv.FloorId_DefaultNormalMap)).toBe(true);


    //--------------------
    // 固定マップへの移動 (EntryPoint を移動先とする)

    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, -1, -1);
    expect(REGame.camera.isFloorTransfering()).toBe(true);  // Camera が移動待機状態になっていること

    TestEnv.performFloorTransfer();
    expect(REGame.map.floorId().equals(TestEnv.FloorId_FlatMap50x50)).toBe(true);   // 移動できていること
    expect(actor1.x).toBe(1);   // EntryPoint の位置へ移動できていること
    expect(actor1.y).toBe(2);   // EntryPoint の位置へ移動できていること


    //--------------------
    // ランダムマップフロアへの移動

    const floor2 = new LFloorId(TestEnv.UnitTestLandId, 2);
    REGame.world._transferEntity(actor1, floor2, -1, -1);
    expect(REGame.camera.isFloorTransfering()).toBe(true);  // Camera が移動待機状態になっていること

    TestEnv.performFloorTransfer();
    expect(REGame.map.floorId().equals(floor2)).toBe(true);   // 移動できていること
    expect(actor1.x).not.toBe(-1);  // いずれかの座標に配置されていること
    expect(actor1.y).not.toBe(-1);  // いずれかの座標に配置されていること

    //--------------------
    // Land マップを経由した固定マップへの移動



    //--------------------
    // 固定マップへの移動 (座標指定)

    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    expect(REGame.camera.isFloorTransfering()).toBe(true);  // Camera が移動待機状態になっていること

    TestEnv.performFloorTransfer();
    expect(REGame.map.floorId().equals(TestEnv.FloorId_FlatMap50x50)).toBe(true);   // 移動できていること
    expect(actor1.x).toBe(5);   // EntryPoint の位置へ移動できていること
    expect(actor1.y).toBe(5);   // EntryPoint の位置へ移動できていること
});

test('TransformRotationBlock', () => {
    // "左前" を1周変換してみる
    {
        // 回転無し
        let pos = SMomementCommon.transformRotationBlock(-1, -1, 8);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(-1);
    
        pos = SMomementCommon.transformRotationBlock(-1, -1, 9);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(-1);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 6);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-1);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(0);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 2);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(1);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 1);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(1);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 4);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(1);

        pos = SMomementCommon.transformRotationBlock(-1, -1, 7);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(0);
    }

    // 桂馬の "右前" を1周変換してみる
    {
        // 回転無し
        let pos = SMomementCommon.transformRotationBlock(1, -2, 8);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-2);
    
        pos = SMomementCommon.transformRotationBlock(1, -2, 9);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(-1);

        pos = SMomementCommon.transformRotationBlock(1, -2, 6);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(1);

        pos = SMomementCommon.transformRotationBlock(1, -2, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(2);

        pos = SMomementCommon.transformRotationBlock(1, -2, 2);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(2);

        pos = SMomementCommon.transformRotationBlock(1, -2, 1);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(1);

        pos = SMomementCommon.transformRotationBlock(1, -2, 4);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(-1);

        pos = SMomementCommon.transformRotationBlock(1, -2, 7);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(-2);
    }
});

test('MoveDiagonal_CollideWalls', () => {
    REGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    TestEnv.performFloorTransfer();

    // 右下に移動できないような壁を作る
    REGame.map.block(6, 5)._tileShape = TileShape.Wall;
    REGame.map.block(5, 6)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // player を右下へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 3));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------
    
    // 壁があるので移動できていない
    expect(actor1.x).toBe(5);
    expect(actor1.y).toBe(5);
});

// TODO: Seed: 1001562234
