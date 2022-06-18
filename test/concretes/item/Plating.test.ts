import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.Plating", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(MRData.getState("kState_UT罠必中").id);

    // アイテム 入手
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [MRData.getState("kState_System_Plating").id], "shield1"));
    inventory.addEntity(shield1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_錆ワナ_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const shield1_UP1 = shield1.actualParam(MRBasics.params.upgradeValue);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [装備]
    RESystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1));
    // player を右 (罠上) へ移動
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(5);     // 乱数調整
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 装備はさびない
    const shield1_UP2 = shield1.actualParam(MRBasics.params.upgradeValue);
    expect(shield1_UP2).toBe(shield1_UP1);
    expect(REGame.messageHistory.includesText("下がらなかった")).toBe(true);    // メッセージとしては "効かなかった" ではなく、パラメータ減少を試行したが意味がなかった旨が記録される
});

