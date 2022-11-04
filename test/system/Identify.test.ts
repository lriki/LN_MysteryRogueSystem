import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { UName } from "ts/mr/utility/UName";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DFloorClass } from "ts/mr/data/DLand";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("system.Identify.Details", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    // 説明文は表示されないこと。
    const dlg = new SDetailsDialog(item1);
    expect(dlg.description.includes("識別されていません")).toBeTruthy();
});

test("system.Identify.Details.KindIdetified", () => {
    TestEnv.newGame();

    const floor1 = new LFloorId(TestEnv.UnitTestLandId, DFloorClass.FloorMap, 2);
    const player1 = TestEnv.setupPlayer(floor1, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    inventory.addEntity(item1);

    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes("\\C[0]薬草")).toBeTruthy();  // 白
});

test("system.Identify.Nickname", () => {
    TestEnv.newGame();

    const floor1 = LFloorId.makeByRmmzFixedMapName("Sandbox-識別");
    const player1 = TestEnv.setupPlayer(floor1, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    MRLively.getCurrentIdentifyer().setNickname(item1.dataId, "Nickname");

    const name1 = UName.makeNameAsItem(item1);
    expect(name1.includes("\\C[3]Nickname")).toBeTruthy();
});

test("system.Identify.Grass", () => {
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    MRLively.world.transferEntity(actor1, LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    TestEnv.performFloorTransfer();

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    const name1 = UName.makeNameAsItem(item2);
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    const name2 = UName.makeNameAsItem(item2);

    // 食べれば、同種のアイテムは識別される。
    expect(name2).not.toBe(name1);
});

test("system.Identify.Equipment", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // 装備 入手
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);

    // 最初は未識別状態
    expect(weapon1.individualIdentified()).toBeFalsy();
    expect(shield1.individualIdentified()).toBeFalsy();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [装備]
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, weapon1));
    MRSystem.dialogContext.postActivity(LActivity.makeEquip(player1, shield1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 装備によって、個体識別済みとなる。
    expect(weapon1.individualIdentified()).toBeTruthy();
    expect(shield1.individualIdentified()).toBeTruthy();
});
