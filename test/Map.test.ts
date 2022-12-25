import { MRLively } from "ts/mr/lively/MRLively";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { UMovement } from "ts/mr/utility/UMovement";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LTileShape } from "ts/mr/lively/LBlock";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DFloorClass } from "ts/mr/data/DLand";
import { STransferMapDialog } from "ts/mr/system/dialogs/STransferMapDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

// フロア番号やマップの直接指定による移動
test("MapTransfarDirectly", () => {

    //--------------------
    // 準備
    TestEnv.newGame();

    // 最初に Player を REシステム管理外の 通常マップに配置しておく
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_DefaultNormalMap, 5, 5);

    // 移動できていること
    expect(MRLively.mapView.currentMap.floorId().equals(TestEnv.FloorId_DefaultNormalMap)).toBe(true);


    //----------------------------------------------------------------------------------------------------
    // 固定マップへの移動 (EntryPoint を移動先とする)

    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, -1, -1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(STransferMapDialog.isFloorTransfering).toBe(true);  // 移動待機状態になっていること

    TestEnv.performFloorTransfer();

    expect(MRLively.mapView.currentMap.floorId().equals(TestEnv.FloorId_FlatMap50x50)).toBe(true);   // 移動できていること
    expect(actor1.mx).toBe(1);   // EntryPoint の位置へ移動できていること
    expect(actor1.my).toBe(2);   // EntryPoint の位置へ移動できていること


    //----------------------------------------------------------------------------------------------------
    // ランダムマップフロアへの移動

    const floor2 = new LFloorId(TestEnv.UnitTestLandId, 2);
    MRLively.world.transferEntity(actor1, floor2, -1, -1);
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(STransferMapDialog.isFloorTransfering).toBe(true);  // 移動待機状態になっていること

    TestEnv.performFloorTransfer();

    expect(MRLively.mapView.currentMap.floorId().equals(floor2)).toBe(true);   // 移動できていること
    expect(actor1.mx).not.toBe(-1);  // いずれかの座標に配置されていること
    expect(actor1.my).not.toBe(-1);  // いずれかの座標に配置されていること

    //----------------------------------------------------------------------------------------------------
    // Land マップを経由した固定マップへの移動



    //----------------------------------------------------------------------------------------------------
    // 固定マップへの移動 (座標指定)

    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(STransferMapDialog.isFloorTransfering).toBe(true);  // Camera が移動待機状態になっていること

    TestEnv.performFloorTransfer();
    expect(MRLively.mapView.currentMap.floorId().equals(TestEnv.FloorId_FlatMap50x50)).toBe(true);   // 移動できていること
    expect(actor1.mx).toBe(5);   // EntryPoint の位置へ移動できていること
    expect(actor1.my).toBe(5);   // EntryPoint の位置へ移動できていること
});

test("TransformRotationBlock", () => {
    // "左前" を1周変換してみる
    {
        // 回転無し
        let pos = UMovement.transformRotationBlock(-1, -1, 8);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(-1);
    
        pos = UMovement.transformRotationBlock(-1, -1, 9);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(-1);

        pos = UMovement.transformRotationBlock(-1, -1, 6);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-1);

        pos = UMovement.transformRotationBlock(-1, -1, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(0);

        pos = UMovement.transformRotationBlock(-1, -1, 2);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(1);

        pos = UMovement.transformRotationBlock(-1, -1, 1);
        expect(pos.x).toBe(0);
        expect(pos.y).toBe(1);

        pos = UMovement.transformRotationBlock(-1, -1, 4);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(1);

        pos = UMovement.transformRotationBlock(-1, -1, 7);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(0);
    }

    // 桂馬の "右前" を1周変換してみる
    {
        // 回転無し
        let pos = UMovement.transformRotationBlock(1, -2, 8);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(-2);
    
        pos = UMovement.transformRotationBlock(1, -2, 9);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(-1);

        pos = UMovement.transformRotationBlock(1, -2, 6);
        expect(pos.x).toBe(2);
        expect(pos.y).toBe(1);

        pos = UMovement.transformRotationBlock(1, -2, 3);
        expect(pos.x).toBe(1);
        expect(pos.y).toBe(2);

        pos = UMovement.transformRotationBlock(1, -2, 2);
        expect(pos.x).toBe(-1);
        expect(pos.y).toBe(2);

        pos = UMovement.transformRotationBlock(1, -2, 1);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(1);

        pos = UMovement.transformRotationBlock(1, -2, 4);
        expect(pos.x).toBe(-2);
        expect(pos.y).toBe(-1);

        pos = UMovement.transformRotationBlock(1, -2, 7);
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
