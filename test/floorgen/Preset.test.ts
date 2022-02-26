import { TestEnv } from "../TestEnv";
import { REGame } from "ts/re/objects/REGame";
import { REData } from "ts/re/data/REData";
import { DTerrainSettingRef } from "ts/re/data/DLand";
import { RESystem } from "ts/re/system/RESystem";
import { TileShape } from "ts/re/objects/LBlock";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { assert } from "ts/re/Common";
import { LMonsterHouseStructure } from "ts/re/objects/structures/LMonsterHouseStructure";

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
    const room = map.rooms()[1];
    room.forEachBlocks(block => {
        expect(block.tileShape()).toBe(TileShape.Floor);
    });
});

test("Preset.GreatHallMonsterHouse", () => {
    TestEnv.newGame();

    
    const landId = REData.lands.findIndex(x => x.name.includes("RandomMaps"));
    const floorId = new LFloorId(landId, 1);
    const floorInfo = floorId.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = REData.getTerrainPreset("kTerrainPreset_GreatHallMH").id;
    floorInfo.monsterHouse.patterns.push({name: "normal", rating: 1});

    const player1 = TestEnv.setupPlayer(floorId);


    const map = REGame.map;
    const structures = map.structures();
    const monsterHouse = structures[1] as LMonsterHouseStructure;
    assert(monsterHouse);
    
    const entities = map.entities();


    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

});

test("Preset.PoorVisibility", () => {
    TestEnv.newGame();

    // 適当なフロアの Preset を強制的に変更
    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = REData.getTerrainPreset("kTerrainPreset_GreatHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 
    const map = REGame.map;

    // 部屋全体が Pass になっていないこと
    const room = map.rooms()[1];
    let foundNoPass = true;
    room.forEachBlocks(x => {
        if (!x._passed) {
            foundNoPass = true;
        }
    });
    expect(foundNoPass).toBeTruthy();

    // 大部屋マップへの遷移時、(0,0) が Pass になってしまう問題の修正確認
    expect(map.block(0, 0)._passed).toBeFalsy();

    //----------

    // Player を左上に配置
    REGame.world._transferEntity(player1, TestEnv.FloorId_FlatMap50x50, room.x1(), room.y1());

    // Enemy を右上に配置 (下向き)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    enemy1.dir = 2;
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, room.x2(), room.y1());

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // 待機
    RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // Enemy は正面に移動している (視界外なので、Player には寄ってこない)
    expect(enemy1.x).toBe(room.x2());
    expect(enemy1.y).toBe(room.y1() + 1);
});

