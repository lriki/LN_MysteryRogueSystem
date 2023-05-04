import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LTileShape } from "ts/mr/lively/LBlock";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { UMovement } from "ts/mr/utility/UMovement";
import { assert } from "ts/mr/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.ArrowTrap.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(MRData.getState("kState_UT罠必中").id);
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢の罠A").id, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp2 < hp1).toBe(true);  // ダメージを受けている
});

test("concretes.trap.ArrowTrap.HitOtherUnit", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢の罠A").id, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // 右を向く Player の右、つまり下から矢が飛んでくるので、それに当たる位置に Enemy を配置する
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 15);
    const enemyhp1 = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [踏む]
    MRSystem.dialogContext.postActivity(LActivity.makeTrample(player1));
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    const enemyhp2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(hp2 == hp1).toBe(true);          // Player はダメージを受けていない
    expect(enemyhp2 < enemyhp1).toBe(true); // Enemy はダメージを受けている
});

test("concretes.trap.ArrowTrap.DropAsItem", () => {
    TestEnv.newGame();

    /*
    □□壁□
    Ｐ□罠壁
    □□□□
    */

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const hp1 = player1.getActualParam(MRBasics.params.hp);

    // アイテム入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_ちからの草A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢の罠A").id, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    
    // 右下に移動できないような壁を作る
    MRLively.mapView.currentMap.block(12, 9)._tileShape = LTileShape.Wall;
    MRLively.mapView.currentMap.block(13, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 矢アイテムが、床に落ちている。上記状況では、Trap と隣接した場所に落ちるはず
    const itemData2 = MRData.getEntity("kEntity_木の矢A");

    const item2 = MRLively.mapView.currentMap.entities().find(e => e.dataId == itemData2.id);
    assert(item2);
    //expect(item2 !== undefined).toBe(true);
    expect(UMovement.checkAdjacentEntities(item2, trap1)).toBe(true);
});
