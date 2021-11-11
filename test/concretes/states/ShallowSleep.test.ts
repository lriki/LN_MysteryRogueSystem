import { REBasics } from "ts/re/data/REBasics";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { TestUtils } from "test/TestUtils";
import { LActionTokenType } from "ts/re/objects/LActionToken";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.states.ShallowSleep", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_CharacterAI;
    const stateId = REBasics.states.nap;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 16, 4);

    // Enemy1 (仮眠状態)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [stateId], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 19, 4);
    expect(enemy1.isStateAffected(REBasics.states.nap)).toBe(true);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 移動。部屋に入る
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withEntityDirection(6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    REGame.world.random().resetSeed(9);     // 乱数調整
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 目は覚ますが移動はしていない
    expect(enemy1.isStateAffected(REBasics.states.nap)).toBe(false);
    expect(enemy1.x).toBe(19);
    expect(enemy1.y).toBe(4);
});

