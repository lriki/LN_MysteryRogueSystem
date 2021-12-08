import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { SView } from "ts/re/system/SView";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.VisibleGrass", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_インビジブルバットA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kビジブルドラッグ").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    const enemy1Visibility1 = SView.getEntityVisibility(enemy1);
    expect(enemy1Visibility1.visible).toBeFalsy();    // 一応確認
    
    const trap1Visibility1 = SView.getEntityVisibility(trap1);
    expect(trap1Visibility1.visible).toBeFalsy();    // 一応確認
    
    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // よくみえ状態になる
    expect(player1.isStateAffected(REData.getState("kState_UTよくみえ").id)).toBeTruthy();
    TestUtils.testCommonGrassEnd(player1, item1);

    const visibility2 = SView.getEntityVisibility(enemy1);
    expect(visibility2.visible).toBeTruthy();

    const trap1Visibility2 = SView.getEntityVisibility(trap1);
    expect(trap1Visibility2.visible).toBeTruthy();
});

