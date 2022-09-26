import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/lively/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { UName } from "ts/mr/utility/UName";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";
import { RESystem } from "ts/mr/system/RESystem";
import { LActivity } from "ts/mr/lively/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("system.Identify.Details", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物_A").id, [], "item1"));
    inventory.addEntity(item1);

    // 説明文は表示されないこと。
    const dlg = new SDetailsDialog(item1);
    expect(dlg.description.includes("識別されていません")).toBeTruthy();
});

test("system.Identify.Details.KindIdetified", () => {
    TestEnv.newGame();

    const floor1 = new LFloorId(TestEnv.UnitTestLandId, 2);
    const player1 = TestEnv.setupPlayer(floor1, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item1"));
    inventory.addEntity(item1);

    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes("\\C[0]薬草")).toBeTruthy();  // 白
});

test("system.Identify.Nickname", () => {
    TestEnv.newGame();

    const floor1 = LFloorId.makeByRmmzFixedMapName("Sandbox-識別");
    const player1 = TestEnv.setupPlayer(floor1, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物_A").id, [], "item1"));
    inventory.addEntity(item1);

    REGame.identifyer.setNickname(item1.dataId, "Nickname");

    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes("\\C[3]Nickname")).toBeTruthy();
});

test("system.Identify.Grass", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world.transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草_A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草_A").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    const name1 = UName.makeNameAsItem(item2);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const name2 = UName.makeNameAsItem(item2);

    // 食べれば、同種のアイテムは識別される。
    expect(name2).not.toBe(name1);
});
