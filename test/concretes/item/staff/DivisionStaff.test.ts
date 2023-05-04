import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { assert } from "ts/mr/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.DivisionStaff.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_分裂の杖A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const entityCount1 = MRLively.mapView.currentMap.entities().length;

    //----------------------------------------------------------------------------------------------------

    // [振る]
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const entityCount2 = MRLively.mapView.currentMap.entities().length;
    expect(entityCount2).toBe(entityCount1 + 1);    // 分裂でエンティティが増えていること
});

// 状態異常を持った倍速 Enemy を分裂させ、ターンを経過させるとクラッシュする問題の修正確認
test("concretes.item.staff.DivisionStaff.Issue1", () => {
    TestEnv.newGame();
    const stateId = MRData.getState("kState_UTまどわし").id

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_分裂の杖A").id, [], "item1"));
    inventory.addEntity(item1);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_ウルフA").id, [stateId], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [振る]
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // findLast
    const entities = MRLively.mapView.currentMap.entities();
    let enemy2;
    for (let i = entities.length - 1; entities.length >= 0; --i) {
        const entity = entities[i];
        if (entity.data.entity.key === "kEnemy_ウルフA") {
            enemy2 = entity;
            break;
        }
    }
    assert(enemy2);
    enemy2._name = "enemy2";

    // 複製や親子関係をチェック
    expect(enemy2).not.toBe(enemy1);
    const states1 = enemy1.states;
    const states2 = enemy2.states;
    expect(states1.length).toBe(states2.length);
    for (let i = 0; i < states2.length; ++i) {
        expect(states2[i]).not.toBe(states1[i]);

        for (const b of states2[i].stateBehabiors()) {
            expect(b.parentObject()).toBe(states2[i]);
        }
    }

    // [待機]
    for (let i = 0; i < 3; i++) {
        MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
    
        MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    }
});
