import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { SActivityFactory } from "ts/system/SActivityFactory";
import { DialogSubmitMode } from "ts/system/SDialog";
import { LSanctuaryBehavior } from "ts/objects/behaviors/LSanctuaryBehavior";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { TileShape } from "ts/objects/LBlock";
import { LProjectableBehavior } from "ts/objects/behaviors/activities/LProjectableBehavior";
import { SEffectSubject } from "ts/system/SEffectContext";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Items.Sanctuary", () => {
    SGameManager.createGameObjects();

    // actor1 配置
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    actor1.dir = 6;
    TestEnv.performFloorTransfer();
    
    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    // item1: actor1 と enemy1 の間に聖域を置いてみる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kItem_サンクチュアリスクロール").id));
    item1._name = "item1";
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 足踏み
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は聖域を避け、左折の法則に従って進行方向の左前に進んでいる
    expect(enemy1.x).toBe(11);
    expect(enemy1.y).toBe(11);
    
    // player を右へ移動。聖域の上に乗る
    RESystem.dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy は攻撃をせずに、左折の法則に従って進む。
    expect(enemy1.x).toBe(10);
    expect(enemy1.y).toBe(10);

    // 壁 聖 敵 のような並びを作り、←方向へ敵を吹き飛ばす
    REGame.map.block(5, 10)._tileShape = TileShape.Wall;
    REGame.world._transferEntity(item1, TestEnv.FloorId_FlatMap50x50, 6, 10);
    LProjectableBehavior.startMoveAsProjectile(RESystem.commandContext, enemy1, new SEffectSubject(actor1), 4, 10);

    // 足踏み
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // "戦闘不能" 付加 -> HP0 -> 削除されている
    expect(enemy1.isDestroyed()).toBe(true);
});
