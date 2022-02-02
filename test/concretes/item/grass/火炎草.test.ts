import { REBasics } from "ts/re/data/REBasics";
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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.火炎草.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const player1Hp1 = player1.actualParam(REBasics.params.hp);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    enemy1.addState(REData.getState("kState_UTからぶり").id);
    REGame.world._transferEntity(enemy1, floorId, 11, 10);

    enemy1.params().param(REBasics.params.hp)?.setIdealParamPlus(500);
    enemy1.setActualParam(REBasics.params.hp, 500);
    const enemy1Hp1 = enemy1.actualParam(REBasics.params.hp);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フレイムリーフ_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フレイムリーフ_A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Enemy はダメージを受ける
    const enemy1Hp2 = enemy1.actualParam(REBasics.params.hp);
    expect(enemy1Hp2 < enemy1Hp1).toBeTruthy();

    // Player はダメージを受けない (Issue 修正確認)
    const player1Hp2 = player1.actualParam(REBasics.params.hp);
    expect(player1Hp2).toBe(player1Hp1);
    
    //----------------------------------------------------------------------------------------------------

    // Enemy の HP をリセット
    enemy1.setActualParam(REBasics.params.hp, 500);

    // [投げる]
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item2).withEntityDirection(6).withConsumeAction(LActionTokenType.Major));
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Enemy はダメージを受ける。ただし、投げ当てた時のダメージ量は飲んだ時よりも少ない。
    const enemy1Hp3 = enemy1.actualParam(REBasics.params.hp);
    expect(enemy1Hp3 < enemy1Hp1).toBeTruthy();
    expect((enemy1Hp1 - enemy1Hp3) < (enemy1Hp1 - enemy1Hp2)).toBeTruthy();
    
    TestUtils.testCommonGrassEnd(player1, item1);
});

