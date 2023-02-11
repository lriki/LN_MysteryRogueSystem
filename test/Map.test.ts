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
import { HMovement } from "ts/mr/lively/helpers/HMovement";

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
