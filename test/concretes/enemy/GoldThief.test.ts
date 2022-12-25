import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LGoldBehavior } from "ts/mr/lively/behaviors/LGoldBehavior";
import { assert } from "ts/mr/Common";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.enemy.GoldThief.Basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    const inventory1 = actor1.getEntityBehavior(LInventoryBehavior);
    inventory1.gainGold(10000);

    const gold1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_GoldA").id, [], "gold1"));
    gold1.getEntityBehavior(LGoldBehavior).setGold(1000);
    TestEnv.transferEntity(gold1, floorId, 13, 10);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_小金猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 12, 10);
    const inventory2 = enemy1.getEntityBehavior(LInventoryBehavior);
    
    // □□□□□
    // Ｐ□敵金□
    // □□□□□
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(actor1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy は Gold の上に移動している
    expect(enemy1.mx).toBe(13);
    expect(enemy1.my).toBe(10);

    // 右へ移動。まだ隣接しない
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy は Gold の上に居座っている
    expect(enemy1.mx).toBe(13);
    expect(enemy1.my).toBe(10);

    // 右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRLively.world.random().resetSeed(9);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation --------------------------------------------------

    // Enemy1 はワープしている
    // また、アイテム化された Gold を持っている
    expect(enemy1.mx != 13 && enemy1.my != 10).toBe(true);
    expect(inventory2.hasAnyItem()).toBe(true);
    const item1 = inventory2.items[0];
    
    // Enemy を攻撃して倒す
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);
    TestEnv.transferEntity(enemy1, floorId, 12, 11);  // 強制移動
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, MRData.system.skills.normalAttack, 2).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている
    expect(enemy1.isDestroyed()).toBe(true);
    expect(item1.floorId.equals(floorId)).toBe(true);
    expect(item1.mx).toBe(12);
    expect(item1.my).toBe(11);
});

test("concretes.enemy.GoldThief.DropItem", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const actor1 = TestEnv.setupPlayer(floorId, 10, 10);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_小金猫A").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 10);
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy を攻撃して倒す
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は倒れ、足元に item が落ちている。ドロップ率 100%
    expect(enemy1.isDestroyed()).toBe(true);
    const item = MRLively.mapView.currentMap.block(11, 10).getFirstEntity();
    assert(item);
    expect(!!item.findEntityBehavior(LGoldBehavior)).toBe(true);
});

