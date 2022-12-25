import { MRLively } from "ts/mr/lively/MRLively";
import { TestEnv } from "../TestEnv";
import "../Extension";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LTileShape } from "ts/mr/lively/LBlock";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SEntityFactory } from "ts/mr/system/internal";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { STransferMapDialog } from "ts/mr/system/dialogs/STransferMapDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.UniqueMap.Basic", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeByRmmzFixedMapName("2-自宅");

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 20, 20);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    TestEnv.transferEntity(item1, floorId, 10, 20);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const map0 = MRLively.mapView.currentMap;
    const entities0 = map0.entities();
    const entityCount0 = entities0.length;
    
    //----------------------------------------------------------------------------------------------------
    // 別マップへ移動する

    MRLively.world.transferEntity(player1, TestEnv.FloorId_FlatMap50x50, 10, 5);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(STransferMapDialog.isFloorTransfering).toBeTruthy();  // 移動待機状態になっていること
    TestEnv.performFloorTransfer();

    // UniqueMap に配置した Entity は消えてないこと
    const map1 = MRLively.mapView.currentMap;
    expect(enemy1.isDestroyed()).toBeFalsy();
    expect(item1.isDestroyed()).toBeFalsy();
    expect(map1.entities().includes(enemy1)).toBeFalsy();
    expect(map1.entities().includes(item1)).toBeFalsy();

    //----------------------------------------------------------------------------------------------------
    // 戻ってくる

    MRLively.world.transferEntity(player1, floorId, 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(STransferMapDialog.isFloorTransfering).toBeTruthy();  // 移動待機状態になっていること
    TestEnv.performFloorTransfer();

    // UniqueMap に配置した Entity は消えてないこと
    const map2 = MRLively.mapView.currentMap;
    const entities2 = map2.entities();
    const entityCount2 = entities2.length;
    expect(enemy1.isDestroyed()).toBeFalsy();
    expect(item1.isDestroyed()).toBeFalsy();
    expect(map2.entities().includes(enemy1)).toBeTruthy();
    expect(map2.entities().includes(item1)).toBeTruthy();
    expect(entityCount2).toBe(entityCount0);
});
