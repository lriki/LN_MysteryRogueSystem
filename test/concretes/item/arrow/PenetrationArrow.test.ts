import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.arrow.PenetrationArrow", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    player1.addState(REData.getState("kState_UnitTest_投擲必中").id);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kシルバーアロー").id));
    item1._name = "item1";
    inventory.addEntity(item1);
    
    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy2"));
    REGame.world._transferEntity(enemy1, floorId, 15, 10);
    REGame.world._transferEntity(enemy2, floorId, 17, 10);
    const enemy1HP1 = enemy1.actualParam(REBasics.params.hp);
    const enemy2HP1 = enemy2.actualParam(REBasics.params.hp);

    // Player の右に壁を作る
    REGame.map.block(11, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withEntityDirection(6).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 壁を貫通し、2体の Enemy にダメージが出ている
    const enemy1HP2 = enemy1.actualParam(REBasics.params.hp);
    const enemy2HP2 = enemy2.actualParam(REBasics.params.hp);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);
    expect(enemy2HP2).toBeLessThan(enemy2HP1);

    // 矢は消滅
    expect(item1.isDestroyed()).toBeTruthy();
});

