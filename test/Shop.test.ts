import { REGame } from "ts/re/objects/REGame";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { RESystem } from "ts/re/system/RESystem";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { REData } from "ts/re/data/REData";
import { LFloorId } from "ts/re/objects/LFloorId";
import { SEventExecutionDialog } from "ts/re/system/dialogs/SEventExecutionDialog";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Shop.Basic", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeByRmmzFixedMapName("Sandbox-店");
    
    // Player
    const player1 = TestEnv.setupPlayer(floorId, 22, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    inventory1.gainGold(1000);

    const keeper1 = REGame.map.block(19, 6).getFirstEntity();
    const keeper2 = REGame.map.block(19, 12).getFirstEntity();
    assert(keeper1);
    assert(keeper2);
    keeper1._name = "keeper1";
    keeper2._name = "keeper2";

    expect(keeper1.getInnermostFactionId()).toBe(REData.system.factions.neutral);
    expect(keeper1.getOutwardFactionId()).toBe(REData.system.factions.neutral);

    // 商品の陳列を確認
    const getItem = (x: number, y: number) => { const e = REGame.map.block(22, 9).getFirstEntity(); assert(e); return e; };
    const items = [
        getItem(22, 9), getItem(23, 9), getItem(24, 9),
        getItem(22, 10), getItem(23, 10), getItem(24, 10),
        getItem(22, 11), getItem(23, 11), getItem(24, 11),
    ];

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // しばらく経過させてみても、店主は移動しないこと。
    for (let i = 0; i < 10; i++) {
        // [待機]
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        expect(keeper1.x).toBe(19);
        expect(keeper1.y).toBe(6);
        expect(keeper2.x).toBe(19);
        expect(keeper2.y).toBe(12);
    }

    //----------------------------------------------------------------------------------------------------

    // [拾う]
    RESystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 店主は通路をふさぐように移動している
    expect(keeper1.x).toBe(19);
    expect(keeper1.y).toBe(7);
    expect(keeper2.x).toBe(19);
    expect(keeper2.y).toBe(13);

    //----------------------------------------------------------------------------------------------------

    // 店主の隣へ移動
    REGame.world._transferEntity(player1, floorId, 20, 7);
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 店主に狙われたりしていないこと
    expect(TestEnv.integration.skillEmittedCount).toBe(0);

    //----------------------------------------------------------------------------------------------------
    
    // [話す]
    RESystem.dialogContext.postActivity(LActivity.makeTalk(player1).withEntityDirection(4).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const dialog = RESystem.dialogContext.activeDialog();
    assert(dialog instanceof SEventExecutionDialog);
    expect(dialog.owner).toBe(keeper1);
    expect(dialog.billingPrice > 0).toBe(true);     // 商品を拾っているので請求がある

    // [はい] (買う)
    RESystem.dialogContext.postActivity(LActivity.makeDialogResult(player1, dialog.owner, "yes"));

    // activeDialog を submit しなくてもコマンドは実行され、清算が行われる 
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    expect(inventory1.gold() < 1000).toBe(true);    // ゴールドが減っている
    expect(inventory1.items[0].getEntityBehavior(LItemBehavior).shopStructureId()).toBe(0);    // 値札が外れている

    // ゲーム中ではここで「ありがとうございました」等メッセージが表示される。
    
    // 会話イベント終了
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 店主は元の位置に移動する
    expect(keeper1.x).toBe(19);
    expect(keeper1.y).toBe(6);
    expect(keeper2.x).toBe(19);
    expect(keeper2.y).toBe(12);
});
