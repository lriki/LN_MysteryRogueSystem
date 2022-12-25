import { TestEnv } from "../TestEnv";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 部屋の入口へ向かって移動する
test("ai.CharacterAI.Moving1", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 19, 4);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 13, 5);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は入り口に向かって↑に移動している
    expect(enemy1.mx).toBe(13);
    expect(enemy1.my).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // 足踏み
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は通路に向かって→に移動している
    expect(enemy1.mx).toBe(14);
    expect(enemy1.my).toBe(4);
});

test.each([1, 2, 3, 4, 5])("ai.CharacterAI.Tracking1(%i)", (a) => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 17, 4);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 20, 4);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // Player は左へ移動して通路に入る。まだ Enemy の視界からは消えない。
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 4).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // Enemy は接近している。
    expect(enemy1.mx).toBe(19);
    expect(enemy1.my).toBe(4);

    //----------------------------------------------------------------------------------------------------

    // Player は左へ移動。Enemy の視界から消える。
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 4).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // Enemy は Player の匂いに従って、必ず接近してくる。
    expect(enemy1.mx).toBe(18);
    expect(enemy1.my).toBe(4);
});

// 壁角斜め方向への攻撃はしない
test("ai.CharacterAI.AttackOnDiagonalEdge", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // enemy1 (Player の右下に配置)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の右に壁を作る
    MRLively.mapView.currentMap.block(11, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    const dialogContext = MRSystem.dialogContext;
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // enemy1 は左折の法則により移動しているはず
    expect(enemy1.mx).toBe(10);
    expect(enemy1.my).toBe(11);
});

test("ai.CharacterAI.ActionPattern", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_CharacterAI, 2, 4);
    const initialHP = player1.getActualParam(MRBasics.params.hp);

    // enemy1 
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ドラゴンA").id));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_CharacterAI, 4, 4);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 足踏み
    const dialogContext = MRSystem.dialogContext;
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    dialogContext.activeDialog().submit();

    MRLively.world.random().resetSeed(4);     // 炎を吐く乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const hp = player1.getActualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

// 通路での移動中、(-1,-1)の方向を向いてしまう問題の修正確認
test("ai.CharacterAI.issue1", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 3, 13);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 13);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    for (let i = 0; i < 5; i++) {
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
        
        expect(enemy1.mx).toBe(11 - (i + 1));
        expect(enemy1.dir).toBe(4);
    }
});

// x2 速, 1回攻撃 のモンスターが通路で他のモンスターとかち合うと落ちる問題の修正確認
test("ai.CharacterAI.Issue2", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 4);
    enemy1.dir = 4;

    // enemy2 (x2 速, 1回攻撃)
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ウルフA").id, [], "enemy2"));
    TestEnv.transferEntity(enemy2, floorId, 14, 4);
    enemy2.dir = 6;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
});

// 通路移動中、向きが変更されない問題の修正確認
test("ai.CharacterAI.Issue3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 20, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 26, 14);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const step = (x: number, y: number) => {
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
        expect(enemy1.mx).toBe(x);
        expect(enemy1.my).toBe(y);
    };

    step(25, 14);
    step(24, 14);
    step(23, 14);
    step(23, 13);
    step(23, 12);
    step(22, 12);
    step(21, 12);
});

// RatedRandomAI が、他 Unit の方へ移動が発生したときに assert が発生する問題の修正確認
test("ai.CharacterAI.Issue_NS#10", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 20, 10);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_バットA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 26, 14);

    const info = DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [MRData.getState("kState_仮眠2").id], "enemy1");
    const enemy2 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy2, floorId, 25, 13);
    const enemy3 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy3, floorId, 26, 13);
    const enemy4 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy4, floorId, 27, 13);

    const enemy5 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy5, floorId, 25, 14);
    const enemy6 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy6, floorId, 27, 14);

    const enemy7 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy7, floorId, 25, 15);
    const enemy8 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy8, floorId, 26, 15);
    const enemy9 = SEntityFactory.newEntity(info);
    TestEnv.transferEntity(enemy9, floorId, 27, 15);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    const step = () => {
        MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
        expect(enemy1.mx).toBe(26);
        expect(enemy1.my).toBe(14);
    };

    step();
    step();
    step();
    step();
    step();
    step();
    step();
});
