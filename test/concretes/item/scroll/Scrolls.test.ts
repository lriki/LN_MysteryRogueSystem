import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRLively } from "ts/mr/lively/MRLively";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { ULimitations } from "ts/mr/utility/ULimitations";
import { paramMaxTrapsInMap } from "ts/mr/PluginParameters";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LGlueToGroundBehavior } from "ts/mr/lively/behaviors/LGlueToGroundBehavior";
import { LTileShape } from "ts/mr/lively/LBlock";
import { TestJsonEx } from "test/TestJsonEx";
import { SGameManager } from "ts/mr/system/SGameManager";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { SAnumationSequel } from "ts/mr/system/SSequel";

beforeAll(() => {
    TestEnv.setupDatabase();
});


//------------------------------------------------------------------------------
// Reinforcement Scroll
//------------------------------------------------------------------------------
test("concretes.item.Scrolls.ReinforcementScroll.Weapon.basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_天の恵みの巻物A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnUtil(shield1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 武器だけ +1 と解呪
    expect(weapon1.getActualParam(MRBasics.params.upgradeValue)).toBe(1);
    expect(shield1.getActualParam(MRBasics.params.upgradeValue)).toBe(0);
    expect(weapon1.isStateAffected(stateId)).toBe(false);
    expect(shield1.isStateAffected(stateId)).toBe(true);
    expect(MRLively.messageHistory.includesText("効かなかった")).toBe(false);
    expect(MRLively.messageHistory.includesText("つよさが 1 増えた")).toBe(true);

    const s = (TestEnv.activeSequelSet.runs()[0].clips()[0].sequels()[0] as SAnumationSequel);
    expect(s.entity().equals(player1)).toBe(true);
    expect(s.anumationlId()).toBe(51);
});

test("concretes.item.Scrolls.ReinforcementScroll.miss", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_天の恵みの巻物A").id, [], "item1"));
    inventory.addEntity(item1);
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 効果が無ければ Animation は表示されない
    expect((TestEnv.activeSequelSet.runs()[0].clips()[0].sequels()[0] instanceof SAnumationSequel)).toBe(false);
});


test("concretes.item.Scrolls.ReinforcementScroll.Weapon.Up3", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const count = inventory.capacity - 1;
    const items = [];
    for (let i = 0; i < count; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_天の恵みの巻物A").id, [], "item1"));
        inventory.addEntity(item);
        items.push(item);
    }
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    inventory.addEntity(weapon1);
    equipmentUser.equipOnUtil(weapon1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    let last = weapon1.getActualParam(MRBasics.params.upgradeValue);
    let total = 0;
    for (let i = 0; i < count; i++) {
        const item = items[i];

        // [読む]
        MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
        
        MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

        const v = weapon1.getActualParam(MRBasics.params.upgradeValue);
        const d = v - last;
        expect(d == 1 || d == 3).toBe(true);    // +1 または +3 で増加
        total += d;
        last = v;
    }

    // 1回くらいは +3 されるだろう
    expect(total).toBeGreaterThan(count);
});

test("concretes.item.Scrolls.ReinforcementScroll.Shield.basic", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;
    const stateId = MRData.system.states.curse;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地の恵みの巻物A").id, [], "item1"));
    inventory.addEntity(item1);
    
    // 装備
    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Weapon1, [stateId], "weapon1"));
    const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_Shield1, [stateId], "shield1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(shield1);
    equipmentUser.equipOnUtil(weapon1);
    equipmentUser.equipOnUtil(shield1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRLively.world.random().resetSeed(5);     // 乱数調整
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 防具だけ +1 と解呪
    expect(weapon1.getActualParam(MRBasics.params.upgradeValue)).toBe(0);
    expect(shield1.getActualParam(MRBasics.params.upgradeValue)).toBe(1);
    expect(weapon1.isStateAffected(stateId)).toBe(true);
    expect(shield1.isStateAffected(stateId)).toBe(false);
    expect(MRLively.messageHistory.includesText("効かなかった")).toBe(false);
    expect(MRLively.messageHistory.includesText("つよさが 1 増えた")).toBe(true);
});


//------------------------------------------------------------------------------
// InflateStorage Scroll
//------------------------------------------------------------------------------
test("concretes.item.Scrolls.InflateStorage", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_壺増大の巻物A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    const storageInventory = item2.getEntityBehavior(LInventoryBehavior);
    const capacity1 = storageInventory.capacity;

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 容量が1増える
    expect(storageInventory.capacity).toBe(capacity1 + 1);
});

//------------------------------------------------------------------------------
// DeflateStorage Scroll
//------------------------------------------------------------------------------
test("concretes.item.Scrolls.DeflateStorage", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_UnitTestFlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_壺縮小の巻物A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item2"));
    inventory.addEntity(item1);
    inventory.addEntity(item2);
    const storageInventory = item2.getEntityBehavior(LInventoryBehavior);
    const capacity1 = storageInventory.capacity;
    
    // アイテムを詰め込む
    const items: LEntity[] = [];
    for (let i = 0; i < storageInventory.capacity; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item" + i));
        storageInventory.addEntity(item);
        items.push(item);
    }

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1, [item2]).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 容量が1増える
    expect(storageInventory.capacity).toBe(capacity1 - 1);

    // アイテムは消えるのではなく、足元にドロップする (独自仕様)
    const lastItem = items[items.length - 1];
    expect(lastItem.isDestroyed()).toBe(false);
    expect(MRLively.mapView.currentMap.block(10, 10).containsEntity(lastItem)).toBeTruthy();
    //expect(lastItem.isDestroyed()).toBe(true);
    
});

//------------------------------------------------------------------------------
// TrapScroll Scroll
//------------------------------------------------------------------------------
test("concretes.item.Scrolls.TrapScroll", () => {
    TestEnv.newGame();
    const floorId = LFloorId.makeFromKeys("MR-Land:UnitTestDungeon1", "kFloor_ランダム罠テスト");

    // Player を未時期別アイテムが出現するダンジョンへ配置する
    const player1 = TestEnv.setupPlayer(floorId);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1
    let items = [];
    for (let i = 0; i < 4; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ワナの巻物A").id, [], `item${i}`));
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


//------------------------------------------------------------------------------
// Sanctuary Scroll
//------------------------------------------------------------------------------
// 張り付いていないので、効果を発揮しない
test("concretes.item.Scrolls.Sanctuary.NoEffect", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_聖域の巻物A").id, [], "item1"));
    TestEnv.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // 足踏み
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 巻物は張り付いていないので、Enemy はアイテムの上に載ってくる
    expect(enemy1.mx).toBe(11);
    expect(enemy1.my).toBe(10);

    //----------------------------------------------------------------------------------------------------
    
    // player を右へ移動。聖域の上に乗る
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は攻撃してくる
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp2).toBeLessThan(hp1);
});

test("concretes.item.Scrolls.Sanctuary.Basic", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // item1: 持たせる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_聖域の巻物A").id, [], "item1"));
    inventory1.addEntity(item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // [置く]
    MRSystem.dialogContext.postActivity(LActivity.makePut(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 攻撃してこない。Enemy は聖域を避け、左折の法則に従って進行方向の左前に進んでいる
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    expect(hp1).toBe(hp2);
    expect(enemy1.mx).toBe(10);
    expect(enemy1.my).toBe(11);

    //----------------------------------------------------------------------------------------------------
    
    // [拾う]
    MRSystem.dialogContext.postActivity(LActivity.makePick(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 拾えていない
    expect(MRLively.messageHistory.includesText("はりついている")).toBeTruthy();
    expect(inventory1.itemCount).toBe(0);
});

test("concretes.item.Scrolls.Sanctuary.ForceDeth", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 4);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 9, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_聖域の巻物A").id, [], "item1"));
    item1.getEntityBehavior(LGlueToGroundBehavior).glued = true;    // 張り付き状態にする
    TestEnv.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 10);
    
    MRLively.mapView.currentMap.block(5, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 壁 聖 敵 のような並びを作り、←方向へ敵を吹き飛ばす
    //LProjectableBehavior.startMoveAsProjectile(RESystem.commandContext, enemy1, new SEffectSubject(player1), 4, 10);
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.getSkill("kSkill_KnockbackAttack").id).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    // "戦闘不能" 付加 -> HP0 -> 削除されている
    const aa = enemy1.isDeathStateAffected();
    expect(enemy1.isDestroyed()).toBe(true);
});

//------------------------------------------------------------------------------
// RestartScroll Scroll
//------------------------------------------------------------------------------
test("concretes.item.Scrolls.RestartScroll", async () => {
    TestEnv.newGame();
    MRLively.recorder.setSavefileId(999);
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする

    // item1
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_時の砂の巻物A").id, [], "item1"));
    inventory1.addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 13, 10);
    const enemy1HP1 = enemy1.getActualParam(MRBasics.params.hp);


    // 初期状態を Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());
    await MRLively.recorder.startRecording();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 右へ移動
    MRSystem.dialogContext.postActivity(LActivity.makeDirectionChange(player1, 6));
    MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // 右へ攻撃
    MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //await REGame.recorder.stopRecording();

    // とりあえず何かダメージ受けているはず
    const enemy1HP2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(enemy1HP2).toBeLessThan(enemy1HP1);

    //----------------------------------------------------------------------------------------------------

    // [読む]
    MRSystem.dialogContext.postActivity(LActivity.makeRead(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    expect(MRSystem.requestedRestartFloorItem).toBeDefined();
    SGameManager.loadGameObjects(TestJsonEx.parse(savedata1));

    //----------------------------------------------------------------------------------------------------

    // 初期状態を Load
    
    const player1_2 = MRLively.world.entity(player1.entityId());
    const inventory2 = player1_2.getEntityBehavior(LInventoryBehavior);

    const enemy1_2 = MRLively.world.entity(enemy1.entityId());
    const enemy1HP3 = enemy1_2.getActualParam(MRBasics.params.hp);

    // 色々元に戻っている
    expect(player1_2.mx).toBe(10);
    expect(player1_2.my).toBe(10);
    expect(enemy1_2.mx).toBe(13);
    expect(enemy1_2.my).toBe(10);
    expect(enemy1HP3).toBe(enemy1HP1);

    // アイテムは消えている
    //expect(inventory2.hasAnyItem()).toBeFalsy();
    // NOTE: v0.6.0 では RMMZ 側でカバーすることにしたので、実装が中途半端になっている
});


