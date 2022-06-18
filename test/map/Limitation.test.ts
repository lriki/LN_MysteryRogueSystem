import { REGame } from "ts/mr/objects/REGame";
import { TestEnv } from "./../TestEnv";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { UMovement } from "ts/mr/usecases/UMovement";
import { RESystem } from "ts/mr/system/RESystem";
import { LTileShape } from "ts/mr/objects/LBlock";
import { FMap } from "ts/mr/floorgen/FMapData";
import { FGenericRandomMapGenerator } from "ts/mr/floorgen/FGenericRandomMapGenerator";
import { FMapBuilder } from "ts/mr/floorgen/FMapBuilder";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRData } from "ts/mr/data/MRData";
import { paramMaxItemsInMap } from "ts/mr/PluginParameters";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { ULimitations } from "ts/mr/usecases/ULimitations";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

// フロア番号やマップの直接指定による移動
test("map.Limitation.Item", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 5, 5);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const existsItems = ULimitations.getItemCountInMap();
    const items = [];
    for (let i = 0; i < (paramMaxItemsInMap - existsItems); i++) {
        const x = i % 20;
        const y = Math.floor(i / 20);
        const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
        REGame.world.transferEntity(item1, floorId, 10 + x, 10 + y);
    }
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_キュアリーフ_A").id, [], "item1"));
    inventory.addEntity(item1);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // 置く
    RESystem.dialogContext.postActivity(LActivity.makePut(player1, item1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 置けない
    expect(inventory.contains(item1)).toBe(true);
    expect(REGame.messageHistory.includesText("できなかった")).toBe(true);

    //----------------------------------------------------------------------------------------------------

    // 投げる
    RESystem.dialogContext.postActivity(LActivity.makeThrow(player1, item1).withEntityDirection(8).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(item1.isDestroyed()).toBe(true);
    expect(ULimitations.getItemCountInMap()).toBe(paramMaxItemsInMap);
    expect(inventory.contains(item1)).toBe(false);
    expect(REGame.messageHistory.includesText("消えてしまった")).toBe(true);
});
