import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { LTileShape } from "ts/mr/lively/LBlock";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LGlueToGroundBehavior } from "ts/mr/lively/behaviors/LGlueToGroundBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// 張り付いていないので、効果を発揮しない
test("concretes.item.scroll.Sanctuary.NoEffect", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_聖域の巻物A").id, [], "item1"));
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

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

test("concretes.item.scroll.Sanctuary.Basic", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

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

test("concretes.item.scroll.Sanctuary.ForceDeth", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 4);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 9, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_聖域の巻物A").id, [], "item1"));
    item1.getEntityBehavior(LGlueToGroundBehavior).glued = true;    // 張り付き状態にする
    MRLively.world.transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 10);
    
    MRLively.map.block(5, 10)._tileShape = LTileShape.Wall;

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
