import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { FBlockComponent, FMap } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { TileShape } from "ts/objects/LBlock";
import { LEntity } from "ts/objects/LEntity";
import { paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId } from "ts/PluginParameters";
import { SEntityFactory } from "./internal";
import { SBehaviorFactory } from "./SBehaviorFactory";
import { RESystem } from "./RESystem";
import { DHelpers, RMMZEventEntityMetadata, RMMZEventPrefabMetadata } from "ts/data/DHelper";
import { DEntityKindId } from "ts/data/DEntityKind";
import { DEntity, DEntity_Default, DEntity_makeFromEventData, DEntity_makeFromEventPageData } from "ts/data/DEntity";



/**
 * RMMZ データ ($dataXXXX) に依存する処理。
 * これらは もともと rmmz フォルダ内 (RMMZIntegration 等) で定義していたが UnitTest でも使用する必要がでてきたため、
 * Visual レイヤーにアクセスする rmmz フォルダからは独立させたもの。
 */
export class SRmmzHelpers {

    static readEntityMetadata(event: Game_Event): DEntity | undefined {
        if (event._pageIndex >= 0) {
            return DEntity_makeFromEventPageData(event.eventId(), event.page());
        }
        else {
            return undefined;
        }
    }


    public static isItemPrefab(data: RMMZEventPrefabMetadata): boolean {
        return !!data.itemId;
    }

    //public static isExitPointPrefab(data: RMMZEventEntityMetadata): boolean {
    //    return data.prefab.includes("ExitPoint");
    //}

    // こちらは UnitTest 用。Game_Event は使えないので $dataMap から、最初のイベントページ固定で作る
    public static createEntitiesFromRmmzFixedMapEventData(): void {
        $dataMap.events.forEach((e: (IDataMapEvent | null)) => {
            if (e) {
                const data = DEntity_makeFromEventData(e);
                if (data) {
                    this.createEntityFromRmmzEvent(data, e.id, e.x, e.y);
                }
            }
        });
    }

    public static createEntityFromRmmzEvent(data: DEntity, eventId: number, x: number, y: number): void {
        const entity = SEntityFactory.newEntity(data)
        entity.rmmzEventId = eventId;
        entity.inhabitsCurrentFloor = true;
        REGame.world._transferEntity(entity, REGame.map.floorId(), x, y);
    }

    public static getPrefabEventData(prefabName: string): IDataMapEvent {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);

        const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabName : false);
        if (index >= 0) {
            const event = databaseMap.events[index];
            if (event) return event;
            throw new Error(`${prefabName} not found in RE-Database map.`);
        }
        else {
            throw new Error(`${prefabName} not found in RE-Database map.`);
        }
    }

    public static getRegionId(x: number, y: number): number {
        if ($dataMap.data) {
            const width = $dataMap.width ?? 0;
            const height = $dataMap.height ?? 0;
            return $dataMap.data[(5 * height + y) * width + x];
        }
        else {
            return 0;
        }
    }
    

    public static buildFixedMapData(map: FMap) {
        if (!$dataMap) {
            throw new Error();
        }
        const width = $dataMap.width ?? 10;
        const height = $dataMap.height ?? 10;
        map.reset(width, height);

        for (let y = 0; y < map.height(); y++) {
            for (let x = 0; x < map.width(); x++) {
                const block = map.block(x, y);

                if (Game_Map_Impl.checkPassage(x, y, 0xF)) {
                    block.setTileShape(TileShape.Floor);
                }
                else {
                    block.setTileShape(TileShape.HardWall);
                }

                const regionId = this.getRegionId(x, y);
                if (regionId == paramFixedMapRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                }
                else if (regionId == paramFixedMapMonsterHouseRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                    block.setMonsterHouseTypeId(DBasics.monsterHouses.fixed);
                }
                else if (regionId == paramFixedMapPassagewayRegionId) {
                    block.setComponent(FBlockComponent.Passageway);
                }
            }
        }
    }
}

/**
 * Game_Map のうち通行判定など、$dataMap を参照したい処理を持ってきたもの。
 * UnitTest でも使いたいので Game_Map は参照できない。
 */
class Game_Map_Impl {
    // Game_Map.prototype.tileset
    public static tileset(): IDataTileset {
        return $dataTilesets[$dataMap.tilesetId];
    };

    // Game_Map.prototype.tilesetFlags
    public static tilesetFlags(): number[] {
        const tileset = this.tileset();
        if (tileset) {
            return tileset.flags;
        } else {
            return [];
        }
    }

    // Game_Map.prototype.tileId
    public static tileId = function(x: number, y: number, z: number) {
        const width = $dataMap.width;
        const height = $dataMap.height;
        return $dataMap.data[(z * height + y) * width + x] || 0;
    };

    // Game_Map.prototype.layeredTiles
    public static layeredTiles(x: number, y: number): number[] {
        const tiles = [];
        for (let i = 0; i < 4; i++) {
            tiles.push(this.tileId(x, y, 3 - i));
        }
        return tiles;
    };

    // Game_Map.prototype.allTiles 
    public static allTiles(x: number, y: number): number[] {
        // Tile 化された Event は考慮しない (Game_Event は参照できない)
        return this.layeredTiles(x, y);
    };

    // Game_Map.prototype.checkPassage 
    public static checkPassage(x: number, y: number, bit: number): boolean {
        const flags = this.tilesetFlags();
        const tiles = this.allTiles(x, y);
        for (const tile of tiles) {
            const flag = flags[tile];
            if ((flag & 0x10) !== 0) {
                // [*] No effect on passage
                continue;
            }
            if ((flag & bit) === 0) {
                // [o] Passable
                return true;
            }
            if ((flag & bit) === bit) {
                // [x] Impassable
                return false;
            }
        }
        return false;
    }
}

