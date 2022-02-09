import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REBasics } from "ts/re/data/REBasics";
import { TileShape } from "ts/re/objects/LBlock";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { UMovement } from "ts/re/usecases/UMovement";
import { assert } from "ts/re/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.trap.ArrowTrap.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.addState(REData.getState("kState_UT罠必中").id);
    const hp1 = player1.actualParam(REBasics.params.hp);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_木の矢の罠_A").id, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.actualParam(REBasics.params.hp);
    expect(hp2 < hp1).toBe(true);  // ダメージを受けている
});

test("concretes.trap.ArrowTrap.HitOtherUnit", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    player1.dir = 6;
    const hp1 = player1.actualParam(REBasics.params.hp);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_木の矢の罠_A").id, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 10, 10);

    // 右を向く Player の右、つまり下から矢が飛んでくるので、それに当たる位置に Enemy を配置する
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 10, 15);
    const enemyhp1 = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [踏む]
    RESystem.dialogContext.postActivity(LActivity.makeTrample(player1));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp2 = player1.actualParam(REBasics.params.hp);
    const enemyhp2 = enemy1.actualParam(REBasics.params.hp);
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
    const hp1 = player1.actualParam(REBasics.params.hp);

    // アイテム入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( REData.getEntity("kEntity_パワードラッグ_A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // trap 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_木の矢の罠_A").id, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 12, 10);
    
    // 右下に移動できないような壁を作る
    REGame.map.block(12, 9)._tileShape = TileShape.Wall;
    REGame.map.block(13, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 矢アイテムが、床に落ちている。上記状況では、Trap と隣接した場所に落ちるはず
    const itemData2 = REData.getEntity("kEntity_ウッドアロー_A");

    const item2 = REGame.map.entities().find(e => e.dataId() == itemData2.id);
    assert(item2);
    //expect(item2 !== undefined).toBe(true);
    expect(UMovement.checkAdjacentEntities(item2, trap1)).toBe(true);
});
