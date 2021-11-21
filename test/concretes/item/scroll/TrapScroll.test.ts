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

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.scroll.TrapScroll", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeFromKeys("RE-Land:UnitTestDungeon1", "kFloor_ランダム罠テスト");

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(player1, floorId);
    TestEnv.performFloorTransfer();
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_トラップスクロール").id, [], "item1"));
    inventory.addEntity(item1);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    const count1 = ULimitations.getTrapCountInMap();

    // [読む]
    RESystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(ULimitations.getTrapCountInMap()).toBe(count1 + 30);
});

