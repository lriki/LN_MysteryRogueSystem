import { TestJsonEx } from "test/TestJsonEx";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { SGameManager } from "ts/mr/system/SGameManager";
import { TestEnv } from "../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// LEventServer を保存していなかったため、以前のゲーム状態の Behavior を参照していた問題の修正確認
test("system.SaveLoad.EventServerIssue", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;
    const stateId = MRData.getState("kState_System_kNap").id;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_木の矢A").id, [], "item1"));
    inventory.addEntity(item1);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [stateId], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 20, 20);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());

    // NewGame
    TestEnv.newGame();

    // Load
    SGameManager.loadGame(TestJsonEx.parse(savedata1), false);

    // Load 後は、Dialog を開くため 1 回必要
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [撃つ]
    const activity1 = LActivity.makeShooting(player1, item1).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity1);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // EventServer への unsubscribe 時、BehaviorId の比較が正しくなかったため、リロードしたデータにおいて Behavior の登録解除がなされない問題の修正確認
    enemy1.destroy();
    for (let i = 0; i < 2; i++) {
        // [待機]
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    //----------------------------------------------------------------------------------------------------

    // クラッシュしなければOK.
});

