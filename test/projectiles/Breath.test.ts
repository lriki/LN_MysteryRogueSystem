import { assert } from "ts/re/Common";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "./../TestEnv";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { LTileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("projectiles.Breath", () => {
    TestEnv.newGame();

    // Player
    const actor1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // アイテムを作ってインベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ドラゴン草_A").id, [], "item1"));
    actor1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // 投げ当てテスト用に壁を作る
    REGame.map.block(12, 10)._tileShape = LTileShape.Wall;

    RESystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    RESystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();

    // スキル起点の特殊効果を持った Projectile は地面に落下せずに消える
    const proj = REGame.map.block(11, 10).layer(DBlockLayerKind.Ground).firstEntity();
    expect(proj).toBe(undefined);
});

