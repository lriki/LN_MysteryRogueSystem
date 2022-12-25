import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("projectiles.MagicBullet", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // actor1 配置
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_大損の杖A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 15, 10);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const count1 = MRLively.mapView.currentMap.entities().length;

    //----------------------------------------------------------------------------------------------------

    // [振る]
    MRSystem.dialogContext.postActivity(LActivity.makeWave(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // const hp = enemy1.actualParam(REBasics.params.hp);
    // const count2 = REGame.map.entities().length;
    // // スキル起点の特殊効果を持った Projectile は地面に落下せずに消える
    const block = MRLively.mapView.currentMap.block(15, 10);
    //const proj = .layer(DBlockLayerKind.Ground).firstEntity();
    expect(block.getFirstEntity()).toBe(undefined);
});
