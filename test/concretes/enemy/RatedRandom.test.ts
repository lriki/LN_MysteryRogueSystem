import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.RatedRandom", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_バットA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 20, 10);

    MRLively.world.random().resetSeed(9);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 10 ターン分 シミュレーション実行
    for (let i = 0; i < 10; i++) {
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    // ふらふら移動するため、まっすぐこちらに向かってくることはないはず
    expect(enemy1.mx != 11 && enemy1.my != 10).toBe(true);
});

// ランダム行動の中で、攻撃が発生した時にクラッシュすることがある問題の修正確認
test("concretes.states.RatedRandom.Issue1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    /*
    　■■　
    ■ｐ敵■
    　■■　
    */
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_バットA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 10);
    MRLively.mapView.currentMap.block(10, 9)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(11, 9)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(9, 10)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(12, 10)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(10, 11)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(11, 11)._tileShape = LTileShape.Wall;
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // シミュレーション実行
    for (let i = 0; i < 20; i++) {
        player1.setActualDamgeParam(MRBasics.params.hp, 0);
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }
});
