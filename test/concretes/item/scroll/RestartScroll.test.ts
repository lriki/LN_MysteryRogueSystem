import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { MRBasics } from "ts/re/data/MRBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SGameManager } from "ts/re/system/SGameManager";
import { TestEnv } from "test/TestEnv";
import { TestJsonEx } from "test/TestJsonEx";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";


beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.RestartScroll", async () => {
    TestEnv.newGame();
    REGame.recorder.setSavefileId(999);
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_リスタートスクロール_A").id, [], "item1"));
    inventory1.addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, floorId, 13, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);


    // 初期状態を Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());
    await REGame.recorder.startRecording();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右へ移動
    RESystem.dialogContext.postActivity(LActivity.makeDirectionChange(player1, 6));
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // 右へ攻撃
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //await REGame.recorder.stopRecording();

    // とりあえず何かダメージ受けているはず
    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);

    //----------------------------------------------------------------------------------------------------

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(RESystem.requestedRestartFloorItem).toBeDefined();
    SGameManager.loadGameObjects(TestJsonEx.parse(savedata1));

    //----------------------------------------------------------------------------------------------------

    // 初期状態を Load
    
    const player1_2 = REGame.world.entity(player1.entityId());
    const inventory2 = player1_2.getEntityBehavior(LInventoryBehavior);

    const enemy1_2 = REGame.world.entity(enemy1.entityId());
    const enemy1HP3 = enemy1_2.actualParam(MRBasics.params.hp);

    // 色々元に戻っている
    expect(player1_2.mx).toBe(10);
    expect(player1_2.my).toBe(10);
    expect(enemy1_2.mx).toBe(13);
    expect(enemy1_2.my).toBe(10);
    expect(enemy1HP3).toBe(enemy1HP1);

    // アイテムは消えている
    //expect(inventory2.hasAnyItem()).toBeFalsy();
    // NOTE: v0.6.0 では RMMZ 側でカバーすることにしたので、実装が中途半端になっている
});

