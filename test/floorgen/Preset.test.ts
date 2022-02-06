import { TestEnv } from "../TestEnv";
import { FMap } from "ts/re/floorgen/FMapData";
import { FGenericRandomMapGenerator } from "ts/re/floorgen/FGenericRandomMapGenerator";
import { FMapBuilder } from "ts/re/floorgen/FMapBuilder";
import { REGame } from "ts/re/objects/REGame";
import { REData } from "ts/re/data/REData";
import { DTerrainPresetRef } from "ts/re/data/DLand";
import { RESystem } from "ts/re/system/RESystem";
import { TileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Preset.GreatHall", () => {
    TestEnv.newGame();

    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presets = [new DTerrainPresetRef(REData.getTerrainPreset("kTerrainPreset_GreatHall").id, 1)];

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const map = REGame.map;
    for (let y = 0; y < map.height(); y++) {
        for (let x = 0; x < map.width(); x++) {
            const block = map.block(x, y);
            expect(block.tileShape()).toBe(TileShape.Floor);
        }
    }

});

