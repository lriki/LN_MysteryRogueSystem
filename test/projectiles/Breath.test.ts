import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { LTileShape } from "ts/mr/lively/LBlock";

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
    MRLively.map.block(12, 10)._tileShape = LTileShape.Wall;

    MRSystem.scheduler.stepSimulation();

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(actor1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();

    // スキル起点の特殊効果を持った Projectile は地面に落下せずに消える
    const proj = MRLively.map.block(11, 10).layer(DBlockLayerKind.Ground).firstEntity();
    expect(proj).toBe(undefined);
});

