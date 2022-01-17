import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { TileShape } from "ts/re/objects/LBlock";
import { LProjectableBehavior } from "ts/re/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/re/system/SEffectContext";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Items.Sanctuary", () => {
    TestEnv.newGame();

    // player1 配置
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_サンクチュアリスクロール").id, [], "item1"));
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------
    
    // 足踏み
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は聖域を避け、左折の法則に従って進行方向の左前に進んでいる
    expect(enemy1.x).toBe(11);
    expect(enemy1.y).toBe(11);

    //----------------------------------------------------------------------------------------------------
    
    // player を右へ移動。聖域の上に乗る
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // Enemy は攻撃をせずに、左折の法則に従って進む。
    expect(enemy1.x).toBe(10);
    expect(enemy1.y).toBe(10);

});

test("Items.Sanctuary.ForceDeth", () => {
    TestEnv.newGame();
    
    // player1 配置
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 4);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 9, 10);

    // item1: player1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_サンクチュアリスクロール").id, [], "item1"));
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 10);
    
    REGame.map.block(5, 10)._tileShape = TileShape.Wall;

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // 壁 聖 敵 のような並びを作り、←方向へ敵を吹き飛ばす
    //LProjectableBehavior.startMoveAsProjectile(RESystem.commandContext, enemy1, new SEffectSubject(player1), 4, 10);

    // 足踏み
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, REData.getSkill("kSkill_KnockbackAttack").id).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    // "戦闘不能" 付加 -> HP0 -> 削除されている
    const aa = enemy1.isDeathStateAffected();
    expect(enemy1.isDestroyed()).toBe(true);
});
