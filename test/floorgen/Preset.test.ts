import { TestEnv } from "../TestEnv";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRData } from "ts/mr/data/MRData";
import { DFloorClass, DTerrainSettingRef } from "ts/mr/data/DLand";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LTileShape } from "ts/mr/lively/LBlock";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { assert } from "ts/mr/Common";
import { LMonsterHouseStructure } from "ts/mr/lively/structures/LMonsterHouseStructure";
import { MonsterHouseState } from "ts/mr/lively/LRoom";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Preset.GreatHall", () => {
    TestEnv.newGame();

    // 適当なフロアの Preset を強制的に変更
    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_GreatHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // 全部床であることを確認する
    const map = MRLively.map;
    const room = map.rooms()[1];
    room.forEachBlocks(block => {
        assert(block.tileShape() == LTileShape.Floor);
        expect(block.tileShape()).toBe(LTileShape.Floor);
    });
});

test("Preset.GreatHallMonsterHouse", () => {
    TestEnv.newGame();

    // 大部屋モンスターハウス
    const landId = MRData.lands.findIndex(x => x.name.includes("RandomMaps"));
    const floorId = new LFloorId(landId, DFloorClass.FloorMap, 1);
    const floorInfo = floorId.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_GreatHallMH").id;

    const player1 = TestEnv.setupPlayer(floorId);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    const map = MRLively.map;
    const structures = map.structures();
    const monsterHouse = structures[1] as LMonsterHouseStructure;
    assert(monsterHouse);

    // 最初から Activated
    assert(monsterHouse.monsterHouseState() == MonsterHouseState.Activated);
});

test("Preset.PoorVisibility", () => {
    TestEnv.newGame();

    // 適当なフロアの Preset を強制的に変更
    const floorInfo = TestEnv.FloorId_FlatMap50x50.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_GreatHall").id;

    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50); 
    const map = MRLively.map;

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
    MRLively.world.transferEntity(player1, TestEnv.FloorId_FlatMap50x50, room.mx1, room.my1);

    // Enemy を右上に配置 (下向き)
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    enemy1.dir = 2;
    MRLively.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, room.mx2, room.my1);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // 待機
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // Enemy は正面に移動している (視界外なので、Player には寄ってこない)
    expect(enemy1.mx).toBe(room.mx2);
    expect(enemy1.my).toBe(room.my1 + 1);
});

test("Preset.DefaultMonsterHouse", () => {
    TestEnv.newGame();

    const landId = MRData.lands.findIndex(x => x.name.includes("RandomMaps"));
    const floorId = new LFloorId(landId, DFloorClass.FloorMap, 1);
    const floorInfo = floorId.floorInfo();
    floorInfo.fixedMapName = "";
    floorInfo.presetId = MRData.getFloorPreset("kFloorPreset_Test_DefaultMH").id;

    const player1 = TestEnv.setupPlayer(floorId);

    MRSystem.scheduler.stepSimulation();   // Advance Simulation ----------

    // ひとつ MH ができている
    const map = MRLively.map;
    const structures = map.structures();
    const monsterHouse = structures[1] as LMonsterHouseStructure;
    assert(monsterHouse);

    // 部屋の外に Entity が配置されていないことの確認
    for (const entity of map.entities()) {
        const block = map.block(entity.mx, entity.my);
        expect(block.isFloorLikeShape()).toBeTruthy();
    }
});
