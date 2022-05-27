import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { UName } from "ts/re/usecases/UName";
import { LActionTokenType } from "ts/re/objects/LActionToken";
import { ULimitations } from "ts/re/usecases/ULimitations";
import { paramMaxTrapsInMap } from "ts/re/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.TrapScroll", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_ランダム罠テスト");

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(player1, floorId);
    TestEnv.performFloorTransfer();
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    let items = [];
    for (let i = 0; i < 4; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_トラップスクロール_A").id, [], `item${i}`));
        inventory.addEntity(item);
        items.push(item);
    }

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 設置数最大になるまで読んでみる
    let lastCount = ULimitations.getTrapCountInMap();
    for (const item of items) {
        // [読む]
        RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        
        RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        const e = Math.min(lastCount + 30, paramMaxTrapsInMap);
        expect(ULimitations.getTrapCountInMap()).toBe(e);
        lastCount = ULimitations.getTrapCountInMap();
    }
});

