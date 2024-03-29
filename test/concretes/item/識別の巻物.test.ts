import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { UName } from "ts/mr/utility/UName";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("concretes.item.識別の巻物", () => {
    TestEnv.newGame();

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    inventory.addEntity(item2);

    const name1 = UName.makeNameAsItem(item2);
    expect(name1.includes("\\C[14]")).toBeTruthy(); // 黄色

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    const activity = LActivity.makeRead(player1, item1, [item2]).withConsumeAction();
    MRSystem.dialogContext.postActivity(activity);
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const name2 = UName.makeNameAsItem(item2);
    expect(name1).not.toBe(name2);  // 少なくとも、識別の前後で表示名が変わっていること
    expect(name2.includes("\\C[0]薬草")).toBeTruthy();  // 白
});

