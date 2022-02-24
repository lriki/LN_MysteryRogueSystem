import { TestEnv } from "../TestEnv";
import { REGame } from "ts/re/objects/REGame";
import { REData } from "ts/re/data/REData";
import { DTerrainSettingRef } from "ts/re/data/DLand";
import { RESystem } from "ts/re/system/RESystem";
import { TileShape } from "ts/re/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Preset.GreatHall", () => {
    TestEnv.newGame();

    // 適当なフロアの Preset を強制的に変更
    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = REData.getTerrainPreset("kTerrainPreset_GreatHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // 全部床であることを確認する
    const map = REGame.map;
    for (let y = 0; y < map.height(); y++) {
        for (let x = 0; x < map.width(); x++) {
            const block = map.block(x, y);
            expect(block.tileShape()).toBe(TileShape.Floor);
        }
    }

});

test("Preset.PoorVisibility", () => {
    TestEnv.newGame();

    // 適当なフロアの Preset を強制的に変更
    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = REData.getTerrainPreset("kTerrainPreset_GreatHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const map = REGame.map;

    // 部屋全体が Pass になっていないこと
    const room = map.rooms()[0];
    let foundNoPass = true;
    room.forEachBlocks(x => {
        if (!x._passed) {
            foundNoPass = true;
        }
    });
    expect(foundNoPass).toBeTruthy();

    // 大部屋マップへの遷移時、(0,0) が Pass になってしまう問題の修正確認
    expect(map.block(0, 0)._passed).toBeFalsy();
});

