import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "../../../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.grass.RevivalGrass.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const hp1 = player1.getActualParam(MRBasics.params.hp);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // アイテム作成 & インベントリに入れる
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle( MRData.getEntity("kEntity_RevivalGrassA").id, [], "item1"));
    inventory.addEntity(item1);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, TestEnv.FloorId_UnitTestFlatMap50x50, 10, 11);
    enemy1.getEntityBehavior(LUnitBehavior).setSpeedLevel(2); // 倍速化

    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------

    player1.setParamCurrentValue(MRBasics.params.hp, 1);

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation ----------

    // 倒されるが、復活して HP が回復している。
    // また Enemy は倍速であるが復活した直後はターンは回らず、Scheduler はリセットされる。
    const hp2 = player1.getActualParam(MRBasics.params.hp);
    //expect(hp2).toBe(hp1);
    // TODO: 未実装

    //expect(inventory.entities()[0].dataId() == REData.getEntity("kEntity_雑草A").id).toBe(true);
});

