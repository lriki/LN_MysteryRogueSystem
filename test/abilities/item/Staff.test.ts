import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { UName } from "ts/re/usecases/UName";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Staff.Knockback", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kふきとばしの杖").id));
    item1._name = "item1";
    inventory.addEntity(item1);

    // Entity作成時に指定しない場合は DEntity の remaining パラメータから初期値が取られる
    const dn = item1.getDisplayName();
    expect(dn.capacity).toBe(5);

    // 残り使用回数を [1] にしておく
    item1.setActualParam(REBasics.params.remaining, 1);
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    
    // 振ってみる
    {
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
        // [振る]
        const activity2 = LActivity.makeWave(actor1, item1).withConsumeAction();
        RESystem.dialogContext.postActivity(activity2);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(enemy1.x).toBe(20);  // 吹き飛ばし効果で 10Block 後退 & Enemy ターンで Player に 1Block 近づく
        expect(item1.actualParam(REBasics.params.remaining)).toBe(0);    // 使用回数が減っている
    }

    // 振ってみる (使用回数切れ)
    {
        // [振る]
        const activity2 = LActivity.makeWave(actor1, item1).withConsumeAction();
        RESystem.dialogContext.postActivity(activity2);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(enemy1.x).toBe(19);  // 杖を振っても何も起こらないので引き続き近づいてくる
        expect(item1.actualParam(REBasics.params.remaining)).toBe(0);    // 使用回数は 0 のまま。余計に減算されたりしないこと。
    }

    // 投げてみる
    {
        REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
        // [投げる]
        const activity1 = LActivity.makeThrow(actor1, item1).withConsumeAction();
        RESystem.dialogContext.postActivity(activity1);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

        
        expect(enemy1.x).toBe(20);  // 吹き飛ばし効果で 10Block 後退 & Enemy ターンで Player に 1Block 近づく

    }

});

test("Items.Staff.Identify", () => {
    TestEnv.newGame();

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kふきとばしの杖").id, [], "item1"));
    inventory.addEntity(item1);

    const nameView1 = item1.getDisplayName();
    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes(nameView1.name)).toBe(false);   // 未識別状態なので、元の名前とは異なる表示名になっている
    expect(name1.includes("[0]\\")).toBe(false);    // "ふきとばしの杖[-1]" のように表示される

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
        
    // [振る]
    const activity2 = LActivity.makeWave(actor1, item1).withConsumeAction();
    RESystem.dialogContext.postActivity(activity2);
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const name2 = UName.makeNameAsItem(item1);
    expect(name2.includes("-1")).toBe(true);    // "ふきとばしの杖[-1]" のように表示される
});

