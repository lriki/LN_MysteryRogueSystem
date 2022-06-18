import { TestEnv } from "../TestEnv";
import { REGame } from "ts/mr/objects/REGame";
import { MRData } from "ts/mr/data/MRData";
import { RESystem } from "ts/mr/system/RESystem";
import { assert } from "ts/mr/Common";
import { USearch } from "ts/mr/usecases/USearch";
import { paramEnemySpawnInvalidArea } from "ts/mr/PluginParameters";

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
