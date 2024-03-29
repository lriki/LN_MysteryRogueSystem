import { TestEnv } from "./../TestEnv";
import { FMap } from "ts/mr/floorgen/FMapData";
import { FGenericRandomMapGenerator } from "ts/mr/floorgen/FGenericRandomMapGenerator";
import { FMapBuilder } from "ts/mr/floorgen/FMapBuilder";
import { MRData } from "ts/mr/data/MRData";
import { paramRandomMapPaddingX, paramRandomMapPaddingY } from "ts/mr/PluginParameters";
import { assert } from "ts/mr/Common";
import { MRLively } from "ts/mr/lively/MRLively";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("RandomMap.1001562234", () => {
    for (let i = 0; i < 20; i++) {
        const seed = 52509;//Math.floor( Math.random()*65535 ); //100156223
        console.log("seed", seed);

        const map = new FMap(TestEnv.FloorId_RandomMapFloor, seed);
        // map.resetFromFullSize(60, 48, 0, 0);
        (new FGenericRandomMapGenerator(map, MRData.terrainSettings[1])).generate();
        (new FMapBuilder()).buildForRandomMap(map);
    
        //map.print();
        //console.log("adjacencies", map.adjacencies());
        //console.log("sectors", map.sectors());
        //console.log("connections", map.connections());
    
        /*
        const sectorToStr = (s: FSector) => {
            return `FSector#${s.id()} (${s.x1()}, ${s.y1()}, ${s.x2()}, ${s.y2()})`
        }
        
        for (const c of map.connections()) {
            console.log(`Connection#${c.id()} ------------------------------------------------------------`);
            console.log(c);
            console.log("edge1.sector", sectorToStr(c.edge1().sector()));
            console.log("edge2.sector", sectorToStr(c.edge2().sector()));
        }
        */
    
        // すべての部屋は、到達可能になっているはず
        for (const b of map.innerBlocks) {
            if (b.isRoom()) {
                assert(b.isContinuation());
                expect(b.isContinuation()).toBe(true);
            }
        }
    }
});

// Pivot 位置の計算が間違っていた問題の修正確認
test("RandomMap.967875183", () => {
    const seed = 967875183;
    const map = new FMap(TestEnv.FloorId_RandomMapFloor, seed);
    const setting = MRData.getTerrainSetting("kTerrainSetting_Small2x2");
    (new FGenericRandomMapGenerator(map, setting)).generate();
    (new FMapBuilder()).buildForRandomMap(map);
});

// フロアの開始から階段まで経路が通っているかを検証するパスで、部屋の無い区画を開始地点として選んでしまう問題の修正確認
// 部屋の無い部屋があるとき、その Pivot が区画外周に隣接してしまいエラーになる問題の修正確認
test("RandomMap.ValidationStartIssue", () => {
    TestEnv.newGame();
    for (let i = 0; i < 100; i++) {
        const seed = i==0 ? 1504087190 : MRLively.world.random().nextInt();
        const map = new FMap(TestEnv.FloorId_RandomMapFloor, seed);
        const setting = MRData.getTerrainSetting("kTerrainSetting_Small2x2");
        (new FGenericRandomMapGenerator(map, setting)).generate();
        (new FMapBuilder()).buildForRandomMap(map);
    }
});
