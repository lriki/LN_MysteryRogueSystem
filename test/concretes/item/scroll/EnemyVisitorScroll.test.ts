import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SView } from "ts/mr/system/SView";
import { SNavigationHelper } from "ts/mr/system/SNavigationHelper";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.EnemyVisitorScroll", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 11, 4);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地獄耳の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_黒幕バットA").id, [], "enemy2"));
    const enemy3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_梅キツネA").id, [MRData.getState("kState_UTアイテム擬態").id], "enemy3"));
    TestEnv.transferEntity(enemy1, floorId, 19, 4);
    TestEnv.transferEntity(enemy2, floorId, 20, 4);
    TestEnv.transferEntity(enemy3, floorId, 20, 5);

    expect(SNavigationHelper.testVisibilityForMinimap(player1, enemy1)).toBeFalsy();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 別の部屋の Enemy も見えるようになっている
    expect(SNavigationHelper.testVisibilityForMinimap(player1, enemy1)).toBeTruthy();
    const enemy1Visibility1 = SView.getEntityVisibility(enemy2);
    expect(enemy1Visibility1.visible).toBeTruthy();

    // 透明状態の Enemy は見えるようになっている
    const enemy2Visibility1 = SView.getEntityVisibility(enemy2);
    expect(enemy2Visibility1.visible).toBeTruthy();

    // アイテム擬態が解けている
    expect(enemy3.isStateAffected(MRData.getState("kState_UTアイテム擬態").id)).toBeFalsy();
});

