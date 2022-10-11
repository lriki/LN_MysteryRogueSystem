import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SView } from "ts/mr/system/SView";
import { SNavigationHelper } from "ts/mr/system/SNavigationHelper";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Visibility.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1 (同じ部屋)
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地獄耳の巻物_A").id, [], "item1"));
    MRLively.world.transferEntity(item1, floorId, 11, 3);

    // trap1 (同じ部屋・露出していない)
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    MRLively.world.transferEntity(trap1, floorId, 12, 4);

    // enemy1 (同じ部屋)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, floorId, 10, 4);

    // exit1 (同じ部屋)
    const exit1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ExitPoint_A").id, [], "exit1"));
    MRLively.world.transferEntity(exit1, floorId, 12, 5);

    // item2 (踏破していない別の部屋)
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地獄耳の巻物_A").id, [], "item2"));
    MRLively.world.transferEntity(item2, floorId, 19, 9);

    // trap2 (踏破していない別の部屋)
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap2"));
    MRLively.world.transferEntity(trap2, floorId, 19, 10);

    // enemy2 (踏破していない別の部屋)
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy2"));
    MRLively.world.transferEntity(enemy2, floorId, 19, 4);

    // exit2 (踏破していない別の部屋)
    const exit2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ExitPoint_A").id, [], "exit2"));
    MRLively.world.transferEntity(exit2, floorId, 18, 9);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(SView.getEntityVisibility(item1).visible).toBeTruthy();
    expect(SView.getEntityVisibility(trap1).visible).toBeFalsy();
    expect(SView.getEntityVisibility(enemy1).visible).toBeTruthy();
    expect(SView.getEntityVisibility(exit1).visible).toBeTruthy();
    expect(SView.getEntityVisibility(item2).visible).toBeFalsy();
    expect(SView.getEntityVisibility(trap2).visible).toBeFalsy();
    expect(SView.getEntityVisibility(enemy2).visible).toBeFalsy();
    expect(SView.getEntityVisibility(exit2).visible).toBeFalsy();

    const minimap = MRSystem.minimapData;
    minimap.update();
    expect(minimap.getData(11, 4, 1)).toBe(minimap.playerMarkerTileId());
    expect(minimap.getData(item1.mx, item1.my, 1)).toBe(minimap.itemMarkerTileId());
    expect(minimap.getData(trap1.mx, trap1.my, 1)).toBe(0);
    expect(minimap.getData(enemy1.mx, enemy1.my, 1)).toBe(minimap.enemyMarkerTileId());;
    expect(minimap.getData(exit1.mx, exit1.my, 1)).toBe(minimap.exitMarkerTileId());;
    expect(minimap.getData(item2.mx, item2.my, 1)).toBe(0);
    expect(minimap.getData(trap2.mx, trap2.my, 1)).toBe(0);
    expect(minimap.getData(enemy2.mx, enemy2.my, 1)).toBe(0);
    expect(minimap.getData(exit2.mx, exit2.my, 1)).toBe(0);
});

