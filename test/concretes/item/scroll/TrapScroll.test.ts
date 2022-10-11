import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { ULimitations } from "ts/mr/utility/ULimitations";
import { paramMaxTrapsInMap } from "ts/mr/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.TrapScroll", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_ランダム罠テスト");

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(player1, floorId);
    TestEnv.performFloorTransfer();
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    let items = [];
    for (let i = 0; i < 4; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ワナの巻物_A").id, [], `item${i}`));
        inventory.addEntity(item);
        items.push(item);
    }

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 設置数最大になるまで読んでみる
    let lastCount = ULimitations.getTrapCountInMap();
    for (const item of items) {
        // [読む]
        MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        const e = Math.min(lastCount + 30, paramMaxTrapsInMap);
        expect(ULimitations.getTrapCountInMap()).toBe(e);
        lastCount = ULimitations.getTrapCountInMap();
    }
});

