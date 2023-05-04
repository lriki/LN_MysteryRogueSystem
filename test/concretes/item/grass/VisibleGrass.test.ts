import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { SView } from "ts/mr/system/SView";
import { UTransfer } from "ts/mr/utility/UTransfer";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.VisibleGrass", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_黒幕バットA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_めぐすり草A").id, [], "item1"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    TestEnv.transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    const enemy1Visibility1 = SView.getEntityVisibility(enemy1);
    expect(enemy1Visibility1.visible).toBeFalsy();    // 一応確認
    
    const trap1Visibility1 = SView.getEntityVisibility(trap1);
    expect(trap1Visibility1.visible).toBeFalsy();    // 一応確認
    
    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // よくみえ状態になる
    expect(player1.isStateAffected(MRData.getState("kState_UTよくみえ").id)).toBeTruthy();
    TestUtils.testCommonGrassEnd(player1, item1);

    const visibility2 = SView.getEntityVisibility(enemy1);
    expect(visibility2.visible).toBeTruthy();

    const trap1Visibility2 = SView.getEntityVisibility(trap1);
    expect(trap1Visibility2.visible).toBeTruthy();

    //----------------------------------------------------------------------------------------------------

    // 次のフロアへ移動
    UTransfer.proceedFloorForwardForPlayer(MRSystem.commandContext);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // フロア移動で解除
    expect(player1.isStateAffected(MRData.getState("kState_UTよくみえ").id)).toBeFalsy();
});

/*
罠に対する よくみえ状態 vs 強制 expose
----------

強制exposeは原作の動作。
敵勢力からも見えるようになる。ややバグぽいが、原作再現を狙うならこっち。
ただし、後から配置されたワナは全部 expose する必要があるのでちょっと変更耐性弱い。

よくみえ状態の場合、原作を知ってる人は驚くかも。
こちらの方が参照透過性の点で有利。不具合が入り込む余地が少ない。
原作と動作は違うが、ある意味「自然」。




*/

