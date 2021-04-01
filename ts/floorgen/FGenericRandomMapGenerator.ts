import { LRandom } from "ts/objects/LRandom";
import { FBlockComponent, FMap } from "./FMapData";

const RoomMinSize = 4;
const AreaMinSize = RoomMinSize + 3;



/**
 * 床・壁・通路・区画情報 などマップの基本情報を生成するモジュール。
 *
 * 次のような要素はこのパスでは生成しない。
 * - アイテム
 * - 罠
 * - 階段
 * - 水路
 * - 壊せない壁
 * - 装飾
 * ...
 *
 * FloorGenerator は一度の map building で複数使われることがある。
 * 特に水路を生成する場合は「部屋を生成せず通路のみとする」モードで FloorGenerator を使い、
 * そうではないモードで生成したマップと合成する。
 *
 * このように各種障害や装飾の生成ソースとしても利用するため、データは GameMap とは独立する。
 *
 * https://github.com/marukrap/RoguelikeDevResources
 * http://www.roguebasin.com/index.php?title=Dungeon-Building_Algorithm
 */
export class FGenericRandomMapGenerator {
    private _map: FMap;
    private _rand: LRandom;

    public constructor(map: FMap, seed: number) {
        this._map = map;
        this._rand = new LRandom(seed);
    }

    public generate(): void {

        if (!this.makeAreas()) {
            return;
        }

        this.makeSectorConnections();
    
        if (!this.makeRoomGuides()) {
            return;
        }
    
        if (!this.makeCorridors()) {
            return;
        }

    }

    private reportError(message: string): void {
        throw new Error(message);
    }
        
    private makeAreas(): boolean {
        const countH = 3;
        const countV = 3;

        /*
        Area の最小構成は次のようになる。

        .= room

        +-------+
        |       |   < 1Tile
        | ....  |
        | ....  |
        | ....  |
        | ....  |
        | ....  |
        |       |   < 2Tile
        |       |   < 2Tile
        +-------+
         ^    ^^
     1Tile    2Tile
               

        - 右端と下端は、通路を垂直または水平に伸ばすための最小領域として残す。

        */

        // Split area
        {
            const w = this._map.width() / countH;
            const h = this._map.height() / countV;
            if (w < AreaMinSize || h < AreaMinSize) {
                this.reportError("Map size too small for number of area divisions.");
                return false;
            }

            for (let y = 0; y < countV; y++) {
                for (let x = 0; x < countH; x++) {
                    const sector = this._map.newSector();
                    const sectorW = (x < countH - 1) ? w : this._map.width() - (w * (countH - 1)); // 最後の Sector は一杯まで広げる
                    const sectorH = (y < countV - 1) ? h : this._map.height() - (h * (countV - 1)); // 最後の Sector は一杯まで広げる
                    sector.setRect(w * x, h * y, sectorW, sectorH);
                }
            }
        }

/*
        for (int y = 0; y < countV; y++) {
            for (int x = 0; x < countH; x++) {
                auto& area = areaList[y * countH + x];

                area->edges[North] = ln::makeObject<FloorAreaEdge>();
                area->edges[South] = ln::makeObject<FloorAreaEdge>();
                area->edges[West] = ln::makeObject<FloorAreaEdge>();
                area->edges[East] = ln::makeObject<FloorAreaEdge>();
                area->edges[North]->area = area->edges[South]->area = area->edges[West]->area = area->edges[East]->area = area;

                if (y > 0) area->edges[North]->adjacencyArea = areaList[(y - 1) * countH + (x)];
                if (y < countV - 1) area->edges[South]->adjacencyArea = areaList[(y + 1) * countH + (x)];
                if (x > 0) area->edges[West]->adjacencyArea = areaList[(y) * countH + (x - 1)];
                if (x < countH - 1) area->edges[East]->adjacencyArea = areaList[(y) * countH + (x + 1)];
            }
        }
        */
        return true;
    }

    private makeSectorConnections(): void {
        for (const sector of this._map.sectors()) {
            
        }
    }
}
