import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { assert } from "ts/mr/Common";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Gameover.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const land = floorId.landData();

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setActualParam(MRBasics.params.hp, 0);

    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // 同じ Land の ExitMap へ遷移中
    const camera = MRLively.camera;
    expect(camera.isFloorTransfering()).toBeTruthy();
    expect(camera.transferingNewFloorId().landId()).toBe(land.id);

    // HP はまだ回復していない
    expect(player1.actualParam(MRBasics.params.hp)).toBe(0); 

    // 冒険の結果は Gameover になっている
    const party = player1.party();
    assert(party);
    expect(party.journal.exitResult).toBe(LandExitResult.Gameover);

    //----------------------------------------------------------------------------------------------------

    // 遷移実行
    MRLively.map.releaseMap();
    TestEnv.performFloorTransfer();

    // 移動完了済み
    expect(camera.isFloorTransfering()).toBeFalsy();

    // ExitMap にある自動実行イベントからの [マップの移動] イベントが実行されるのを想定する
    const map = MRData.getMap("MR-Safety:テスト拠点");
    UTransfer.transterRmmzDirectly(map.mapId, 0, 0);

    // MR-FinishChallenge
    player1.party()?.finishChallenging();

    // 遷移中になる
    expect(camera.isFloorTransfering()).toBeTruthy();
    expect(camera.transferingNewFloorId().rmmzMapId()).toBe(map.mapId);

    // この時点で HPは回復している
    expect(player1.actualParam(MRBasics.params.hp)).toBeGreaterThan(0);

    //----------------------------------------------------------------------------------------------------

    // 遷移実行
    MRLively.map.releaseMap();
    TestEnv.performFloorTransfer();
});
