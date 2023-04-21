import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { TestEnv } from "../../../TestEnv";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEntity } from "ts/mr/lively/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { LTileShape } from "ts/mr/lively/LBlock";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.pots.PotBasic.Crack1", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    
    const items: LEntity[] = [];
    for (let i = 0; i < item1Inventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item" + i));
        item1Inventory.addEntity(item);
        items.push(item);
    }
    
    // Player の右に壁を作る
    MRLively.mapView.currentMap.block(player1.mx + 2, player1.my)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 壺は割れて失われている
    expect(item1.isDestroyed()).toBeTruthy();

    // 壺が割れた位置を中心に、中身は散らばっている
    const ox = player1.mx + 1;
    const oy = player1.my;
    for (const item of items) {
        expect(
            (ox - 1) <= item.mx && item.mx <= (ox + 1) &&
            (oy - 1) <= item.my && item.my <= (oy + 1)).toBeTruthy();
    }
});

test("concretes.item.pots.PotBasic.Crack2_OutOfRange", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 射程に達して落下した場合は割れずに残る
    expect(item1.isDestroyed()).toBeFalsy();
});

test("concretes.item.pots.PotBasic.PotIntoPot", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [入れる]
    MRSystem.dialogContext.postActivity(LActivity.makePutIn(player1, item1, [item2]));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 壺に壺は入らない
    expect(inventory1.contains(item2)).toBeTruthy();
    expect(item1Inventory.contains(item2)).toBeFalsy();
});

test("concretes.item.pots.PotBasic.CollideAllItems", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    const item3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_混乱草A").id, [], "item3"));
    const item4 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_Test_衝突効果なしアイテムA").id, [], "item4"));
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);
    inventory1.addEntity(item1);
    item1Inventory.addEntity(item2);
    item1Inventory.addEntity(item3);
    item1Inventory.addEntity(item4);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1); // HPを1にしておく

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // [投げる]
    MRSystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(6));
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 壺は割れ、中身は全て衝突している。
    // - 混乱状態になる
    // - HPは回復している
    expect(item1.isDestroyed()).toBeTruthy();
    expect(item2.isDestroyed()).toBeTruthy();
    expect(item3.isDestroyed()).toBeTruthy();
    expect(item4.isDestroyed()).toBeTruthy();   // 衝突効果なく明示的に destroy() されていなくても、Inventory から取り出されて親が無ければ GC される
    expect(!!enemy1.states.find(x => x.stateDataId() == MRData.getState("kState_UT混乱").id)).toBe(true);
    expect(enemy1.getActualParam(MRBasics.params.hp)).toBeGreaterThan(10);
});

test("concretes.item.pots.PotBasic.StumbleCrack", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    inventory1.addEntity(item1);
    
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_転び石A").id, [], "trap1"));
    TestEnv.transferEntity(trap1, floorId, 10, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    for (let i = 0; i < 100; i++) {
        player1.setParamCurrentValue(MRBasics.params.hp, 100);  // 適当に HP を回復しておく

        // [踏む]
        MRSystem.dialogContext.postActivity(LActivity.makeTrample(player1));
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        if (item1.isDestroyed()) break;

        // 壺を持ち物に入れる
        item1.removeFromParent();
        inventory1.addEntity(item1);
    }

    // 何回か繰り返せば、落とした時に割れるはず
    expect(item1.isDestroyed()).toBeTruthy();
});
