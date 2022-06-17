import { TestJsonEx } from "test/TestJsonEx";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { MRBasics } from "ts/re/data/MRBasics";
import { REData } from "ts/re/data/REData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { SGameManager } from "ts/re/system/SGameManager";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});


// LEventServer を保存していなかったため、以前のゲーム状態の Behavior を参照していた問題の修正確認
test("system.SaveLoad.EventServerIssue", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // player1 配置
    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_ウッドアロー_A").id, [], "item1"));
    inventory.addEntity(item1);
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());

    // NewGame
    TestEnv.newGame();

    // Load
    SGameManager.loadGame(TestJsonEx.parse(savedata1), false);

    // Load 後は、Dialog を開くため 1 回必要
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity1);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // クラッシュしなければOK.
});

