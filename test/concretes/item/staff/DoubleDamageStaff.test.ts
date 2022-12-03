import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRBasics } from "ts/mr/data/MRBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.staff.DoubleDamageStaff.basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10, 6);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const player1HP1 = player1.getActualParam(MRBasics.params.hp);
    
    // アイテム 入手
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_もろはの杖A").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    MRLively.world.transferEntity(undefined, enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10);
    const enemy1HP1 = enemy1.getActualParam(MRBasics.params.hp);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [振る] (壁に向かって)
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(8).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 相手に効果が無ければ、自分にダメージもない
    const player1HP2 = player1.getActualParam(MRBasics.params.hp);
    const enemy1HP2 = enemy1.getActualParam(MRBasics.params.hp);
    expect(player1HP2).toBe(player1HP1);
    expect(enemy1HP2).toBe(enemy1HP1);

    //----------------------------------------------------------------------------------------------------

    // [振る] (相手に向かって)
    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 相手に効果が出れば、自分にも効果がでる
    const player1HP3 = player1.getActualParam(MRBasics.params.hp);
    const enemy1HP3 = enemy1.getActualParam(MRBasics.params.hp);
    expect(player1HP3).toBeLessThanOrEqual(Math.floor(player1HP1 / 2) + 5);    // 自動回復で若干 HP が回復しているので +5 くらいで判定
    expect(enemy1HP3).toBe(1);

    //----------------------------------------------------------------------------------------------------

    player1.setParamCurrentValue(MRBasics.params.hp, 1);
    enemy1.setParamCurrentValue(MRBasics.params.hp, 1);

    MRSystem.dialogContext.postActivity(LActivity.makeWave(player1, item1).withEntityDirection(6).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const player1HP4 = player1.getActualParam(MRBasics.params.hp);
    const enemy1HP4 = enemy1.getActualParam(MRBasics.params.hp);
    expect(player1HP4).toBe(0);
});
