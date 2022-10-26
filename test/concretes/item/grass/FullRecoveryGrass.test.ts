import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.FullRecoveryGrass", () => {
    TestEnv.newGame();
    const positiveState1 = MRData.getState("kState_UT透明").id;
    const negativeState1 = MRData.getState("kState_UT混乱").id;
    const negativeState2 = MRData.getState("kState_UT目つぶし").id;

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    player1.setParamCurrentValue(MRBasics.params.hp, 1);
    player1.addState(positiveState1);
    player1.addState(negativeState1);
    player1.addState(negativeState2);

    // Enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 15, 10);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_弟切草A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_弟切草A").id, [], "item2"));
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item1);
    player1.getEntityBehavior(LInventoryBehavior).addEntity(item2);

    TestUtils.testCommonGrassBegin(player1, item1);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    // [食べる]
    MRSystem.dialogContext.postActivity(LActivity.makeEat(player1, item1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------
    
    const player1MHP = player1.getParamActualMax(MRBasics.params.hp);
    const player1HP = player1.getActualParam(MRBasics.params.hp);
    expect(player1HP).toBe(player1MHP);
    expect(player1.isStateAffected(positiveState1)).toBeTruthy();
    expect(player1.isStateAffected(negativeState1)).toBeFalsy();
    expect(player1.isStateAffected(negativeState2)).toBeFalsy();

    TestUtils.testCommonGrassEnd(player1, item1);
});

