import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRLively } from "ts/mr/lively/MRLively";
import { LEntity } from "ts/mr/lively/LEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.Scrolls.InflateStorage", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_壺増大の巻物A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    const storageInventory = item2.getEntityBehavior(LInventoryBehavior);
    const capacity1 = storageInventory.capacity;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 容量が1増える
    expect(storageInventory.capacity).toBe(capacity1 + 1);
});

test("concretes.item.Scrolls.DeflateStorage", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_壺縮小の巻物A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    const storageInventory = item2.getEntityBehavior(LInventoryBehavior);
    const capacity1 = storageInventory.capacity;
    
    // アイテムを詰め込む
    const items: LEntity[] = [];
    for (let i = 0; i < storageInventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item" + i));
        storageInventory.addEntity(item);
        items.push(item);
    }

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 容量が1増える
    expect(storageInventory.capacity).toBe(capacity1 - 1);

    // アイテムは消えるのではなく、足元にドロップする (独自仕様)
    const lastItem = items[items.length - 1];
    expect(lastItem.isDestroyed()).toBe(false);
    expect(MRLively.mapView.currentMap.block(10, 10).containsEntity(lastItem)).toBeTruthy();
    //expect(lastItem.isDestroyed()).toBe(true);
    
});

