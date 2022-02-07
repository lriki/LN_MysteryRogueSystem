import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.item.脱出の巻物", () => {
    TestEnv.newGame();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    const inventory = actor1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_エスケープスクロール_A").id, [], "item1"));
    inventory.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const initialHP = enemy1.actualParam(REBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    {
        actor1.dir = 6;

        // [投げる]
        const activity = LActivity.makeThrow(actor1, item2).withConsumeAction(LActionTokenType.Major);
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        expect(initialHP - enemy1.actualParam(REBasics.params.hp)).toBe(1);  // 1ダメージを受けているはず
        expect(item2.isDestroyed()).toBe(true); // item2 は消える
    }

    {
        // [読む]
        const activity = LActivity.makeRead(actor1, item1).withConsumeAction(LActionTokenType.Major);
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
        // ExitMap へ遷移しているはず
        const exitMapId = REGame.map.land2().landData().exitRMMZMapId;
        expect(actor1.floorId.floorNumber()).toBe(exitMapId);
    }
});

