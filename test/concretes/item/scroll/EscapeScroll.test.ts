import { MRBasics } from "ts/re/data/MRBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { UName } from "ts/re/usecases/UName";
import { LFloorId } from "ts/re/objects/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.EscapeScroll.Basic", () => {
    TestEnv.newGame();

    // player1 配置
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id, [], "item1"));
    inventory.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const initialHP = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    {
        player1.dir = 6;

        // [投げる]
        const activity = LActivity.makeThrow(player1, item2).withConsumeAction();
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        expect(initialHP - enemy1.actualParam(MRBasics.params.hp)).toBe(1);  // 1ダメージを受けているはず
        expect(item2.isDestroyed()).toBe(true); // item2 は消える
    }

    //----------------------------------------------------------------------------------------------------

    {
        // [読む]
        const activity = LActivity.makeRead(player1, item1).withConsumeAction();
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        // ExitMap へ遷移しているはず
        const exitMapId = REGame.map.land2().landData().exitRMMZMapId;
        expect(player1.floorId.floorNumber()).toBe(exitMapId);
    }
});

test("concretes.item.EscapeScroll.Identification", () => {
    TestEnv.newGame();

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_フランスパンスクロール_A").id, [], "item1"));
    inventory.addEntity(item2);

    // 他の巻物が未識別であるような環境でも、脱出の巻物は名前がわかる。
    const name1 = UName.makeNameAsItem(item1);
    const name2 = UName.makeNameAsItem(item2);
    expect(name1.includes(item1.data.display.name)).toBeTruthy();
    expect(name2.includes(item2.data.display.name)).toBeFalsy();
});
