import { TestEnv } from "../TestEnv";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRData } from "ts/mr/data/MRData";
import { MRSystem } from "ts/mr/system/MRSystem";
import { assert } from "ts/mr/Common";
import { USearch } from "ts/mr/utility/USearch";
import { paramEnemySpawnInvalidArea } from "ts/mr/PluginParameters";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("map.RandomSpawnLocation.NearPlayer", () => {
    TestEnv.newGame();

    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo;
    floorInfo.fixedMapIndex = -1;
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_HalfHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    for (let i = 0; i < 1000; i++) {
        const block = USearch.selectUnitSpawnableBlock(MRLively.world.random());
        assert(block);
        expect(
            block.mx < player1.mx - paramEnemySpawnInvalidArea ||
            player1.mx + paramEnemySpawnInvalidArea < block.mx ||
            block.my < player1.my - paramEnemySpawnInvalidArea ||
            player1.my + paramEnemySpawnInvalidArea < block.my).toBeTruthy();
    }
});
