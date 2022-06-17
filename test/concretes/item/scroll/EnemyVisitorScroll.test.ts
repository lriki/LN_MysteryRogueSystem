import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { REGame } from "ts/re/objects/REGame";
import { MRBasics } from "ts/re/data/MRBasics";
import { SView } from "ts/re/system/SView";
import { SNavigationHelper } from "ts/re/system/SNavigationHelper";

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
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_モンスタースクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    const enemy2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_インビジブルバットA").id, [], "enemy2"));
    const enemy3 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_ミミックA").id, [REData.getState("kState_UTアイテム擬態").id], "enemy3"));
    REGame.world.transferEntity(enemy1, floorId, 19, 4);
    REGame.world.transferEntity(enemy2, floorId, 20, 4);
    REGame.world.transferEntity(enemy3, floorId, 20, 5);

    expect(SNavigationHelper.testVisibilityForMinimap(player1, enemy1)).toBeFalsy();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 別の部屋の Enemy も見えるようになっている
    expect(SNavigationHelper.testVisibilityForMinimap(player1, enemy1)).toBeTruthy();
    const enemy1Visibility1 = SView.getEntityVisibility(enemy2);
    expect(enemy1Visibility1.visible).toBeTruthy();

    // 透明状態の Enemy は見えるようになっている
    const enemy2Visibility1 = SView.getEntityVisibility(enemy2);
    expect(enemy2Visibility1.visible).toBeTruthy();

    // アイテム擬態が解けている
    expect(enemy3.isStateAffected(REData.getState("kState_UTアイテム擬態").id)).toBeFalsy();
});

