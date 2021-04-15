import { REGame } from "ts/objects/REGame";
import { REGameManager } from "ts/system/REGameManager";
import { TestEnv } from "./TestEnv";
import "./Extension";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('MapTransfar', () => {

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


    //--------------------
    // Land マップを経由した固定マップへの移動

    // ※この処理は RMMZ Game オブジェクトレイヤーで行われるため、ここではテストできない


    //--------------------
    // 固定マップへの座標指定移動

    // Player 入力待ちまで進める
    //RESystem.scheduler.stepSimulation();
    
});
