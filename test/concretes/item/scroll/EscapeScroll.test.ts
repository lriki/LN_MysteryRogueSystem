import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { UName } from "ts/mr/utility/UName";
import { LFloorId } from "ts/mr/lively/LFloorId";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.EscapeScroll.Basic", () => {
    TestEnv.newGame();

    // player1 配置
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_脱出の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    // item2
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_脱出の巻物A").id, [], "item1"));
    inventory.addEntity(item2);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const initialHP = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    {
        player1.dir = 6;

        // [投げる]
        const activity = LActivity.makeThrow(player1, item2).withConsumeAction();
        MRSystem.dialogContext.postActivity(activity);
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        expect(initialHP - enemy1.getActualParam(MRBasics.params.hp)).toBe(1);  // 1ダメージを受けているはず
        expect(item2.isDestroyed()).toBe(true); // item2 は消える
    }

    //----------------------------------------------------------------------------------------------------

    {
        // [読む]
        const activity = LActivity.makeRead(player1, item1).withConsumeAction();
        MRSystem.dialogContext.postActivity(activity);
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
        // ExitMap へ遷移しているはず
        const exitMapId = MRLively.map.land2().landData().exitMapData.id;
        expect(player1.floorId.eventMapData().id).toBe(exitMapId);

        expect(TestEnv.integration.exitResult).toBe(LandExitResult.Escape);
    }
});

test("concretes.item.EscapeScroll.Identification", () => {
    TestEnv.newGame();

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_脱出の巻物A").id, [], "item1"));
    inventory.addEntity(item1);

    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_食料の巻物A").id, [], "item1"));
    inventory.addEntity(item2);

    // 他の巻物が未識別であるような環境でも、脱出の巻物は名前がわかる。
    const name1 = UName.makeNameAsItem(item1);
    const name2 = UName.makeNameAsItem(item2);
    expect(name1.includes(item1.data.display.name)).toBeTruthy();
    expect(name2.includes(item2.data.display.name)).toBeFalsy();
});
