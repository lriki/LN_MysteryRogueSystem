import { TestEnv } from "../TestEnv";
import { REGame } from "ts/re/objects/REGame";
import { MRData } from "ts/re/data/MRData";
import { RESystem } from "ts/re/system/RESystem";
import { assert } from "ts/re/Common";
import { USearch } from "ts/re/usecases/USearch";
import { paramEnemySpawnInvalidArea } from "ts/re/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("map/RandomSpawnLocation.NearPlayer", () => {
    TestEnv.newGame();

    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_HalfHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    for (let i = 0; i < 1000; i++) {
        const block = USearch.selectUnitSpawnableBlock(REGame.world.random());
        assert(block);
        expect(
            block.mx < player1.mx - paramEnemySpawnInvalidArea ||
            player1.mx + paramEnemySpawnInvalidArea < block.mx ||
            block.my < player1.my - paramEnemySpawnInvalidArea ||
            player1.my + paramEnemySpawnInvalidArea < block.my).toBeTruthy();
    }
});
