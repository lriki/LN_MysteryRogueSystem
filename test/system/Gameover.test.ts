import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { assert } from "ts/mr/Common";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { STransferMapDialog } from "ts/mr/system/dialogs/STransferMapDialog";
import { SEntityFactory } from "ts/mr/system/internal";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Gameover.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const land = floorId.landData;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // HP 0 にする
    player1.setParamCurrentValue(MRBasics.params.hp, 0);

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // 同じ Land の ExitMap へ遷移中
    expect(STransferMapDialog.current.newFloorId.landId).toBe(land.id);

    // HP はまだ回復していない
    expect(player1.getActualParam(MRBasics.params.hp)).toBe(0); 

    // 冒険の結果は Gameover になっている
    const party = player1.party();
    assert(party);
    expect(party.journal.exitResult).toBe(LandExitResult.Gameover);

    // 移動待機状態
    expect(STransferMapDialog.isFloorTransfering).toBeTruthy();

    //----------------------------------------------------------------------------------------------------

    // 遷移実行
    MRLively.mapView.currentMap.releaseMap();
    TestEnv.performFloorTransfer();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 移動完了済み
    expect(STransferMapDialog.isFloorTransfering).toBeFalsy();

    // ExitMap にある自動実行イベントからの [マップの移動] イベントが実行されるのを想定する
    const map = MRData.getMap("MR-Safety:テスト拠点");
    UTransfer.transterRmmzDirectly(map.mapId, 0, 0, 2);

    // MR-FinishChallenge
    player1.party()?.finishChallenging();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 遷移中になる
    expect(STransferMapDialog.isFloorTransfering).toBeTruthy();
    expect(STransferMapDialog.current.newFloorId.rmmzMapId).toBe(map.mapId);

    // この時点で HPは回復している
    expect(player1.getActualParam(MRBasics.params.hp)).toBeGreaterThan(0);

    // FP は最大値になっている
    const fp = player1.getActualParam(MRBasics.params.fp);
    const maxfp = player1.getParamActualMax(MRBasics.params.fp);
    expect(fp).toBe(maxfp);

    //----------------------------------------------------------------------------------------------------

    // 遷移実行
    // MRLively.camera.currentMap.releaseMap();
    // TestEnv.performFloorTransfer();
});

// #22 一度ゲームオーバーになった後、アイテムが拾えなくなることがある
test("system.Gameover.Issue22", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const land = floorId.landData;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // ゲームオーバーにする
    player1.setParamCurrentValue(MRBasics.params.hp, 0);
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // ExitMap への遷移実行
    MRLively.mapView.currentMap.releaseMap();
    TestEnv.performFloorTransfer();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    expect(STransferMapDialog.isFloorTransfering).toBeFalsy();
    player1.party()?.finishChallenging();   // MR-FinishChallenge

    //----------------------------------------------------------------------------------------------------
    // 再突入
    MRLively.world.transferEntity(player1, floorId, 10, 10);
    TestEnv.performFloorTransfer();
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    MRLively.world.transferEntity(item1, floorId, 11, 10);
    
    // player を右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // アイテムを拾えているはず
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    expect(inventory1.contains(item1)).toBeTruthy();
});
