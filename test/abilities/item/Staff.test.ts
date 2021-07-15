import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Staff.Knockback", () => {
    TestEnv.newGame();
    const dc = RESystem.dialogContext;

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kふきとばしの杖").id));
    item1._name = "item1";
    inventory.addEntity(item1);

    // Entity作成時に指定しない場合は DEntity の remaining パラメータから初期値が取られる
    const dn = item1.getDisplayName();
    expect(dn.name.includes("[5]")).toBe(true);

    // 残り使用回数を [1] にしておく
    item1.setActualParam(DBasics.params.remaining, 1);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    
    // 振ってみる
    {
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
        // [振る]
        const activity2 = LActivity.makeWave(actor1, item1);
        dc.postActivity(activity2);
        dc.activeDialog().submit(DialogSubmitMode.ConsumeAction);
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(enemy1.x).toBe(20);  // 吹き飛ばし効果で 10Block 後退 & Enemy ターンで Player に 1Block 近づく
        expect(item1.actualParam(DBasics.params.remaining)).toBe(0);    // 使用回数が減っている
    }

    // 振ってみる (使用回数切れ)
    {
        // [振る]
        const activity2 = LActivity.makeWave(actor1, item1);
        dc.postActivity(activity2);
        dc.activeDialog().submit(DialogSubmitMode.ConsumeAction);
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(enemy1.x).toBe(19);  // 杖を振っても何も起こらないので引き続き近づいてくる
        expect(item1.actualParam(DBasics.params.remaining)).toBe(0);    // 使用回数は 0 のまま。余計に減算されたりしないこと。
    }

    // 投げてみる
    {
        REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
        // [投げる]
        const activity1 = LActivity.makeThrow(actor1, item1);
        dc.postActivity(activity1);
        dc.activeDialog().submit(DialogSubmitMode.ConsumeAction);
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        
        expect(enemy1.x).toBe(20);  // 吹き飛ばし効果で 10Block 後退 & Enemy ターンで Player に 1Block 近づく

    }

});
