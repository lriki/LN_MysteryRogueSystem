import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { FBlockComponent, FMap } from "ts/mr/floorgen/FMapData";
import { MRLively } from "ts/mr/lively/MRLively";
import { LTileShape } from "ts/mr/lively/LBlock";
import { paramFixedMapItemShopRoomRegionId, paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId, paramRandomMapPaddingX, paramRandomMapPaddingY } from "ts/mr/PluginParameters";
import { SEntityFactory } from "./internal";
import { DEntityCreateInfo, DEntitySpawner2 } from "ts/mr/data/DEntity";
import { LEntity } from "../lively/LEntity";
import { RmmzEventPrefabAttribute } from "../data/importers/DAttributeReader";
import { DHelpers } from "../data/DHelper";



/**
 * RMMZ データ ($dataXXXX) に依存する処理。
 * これらは もともと rmmz フォルダ内 (RMMZIntegration 等) で定義していたが UnitTest でも使用する必要がでてきたため、
 * Visual レイヤーにアクセスする rmmz フォルダからは独立させたもの。
 */
export class SRmmzHelpers {

    static readEntityMetadata(event: Game_Event, rmmzMapId: number): DEntitySpawner2 | undefined {
        if (event._pageIndex >= 0) {
            const data = event.event();
            assert(data);
            return DEntitySpawner2.makeFromEventPageData(data, event.page(), rmmzMapId);
        }
        else {
            return undefined;
        }
    }


    // public static isItemPrefab(data: RmmzEventPrefabMetadata): boolean {
    //     return !!data.itemId;
    // }

    //public static isExitPointPrefab(data: RMMZEventEntityMetadata): boolean {
    //    return data.prefab.includes("ExitPoint");
    //}

    // こちらは UnitTest 用。Game_Event は使えないので $dataMap から、最初のイベントページ固定で作る
    public static createEntitiesFromRmmzFixedMapEventData(rmmzMapId: number): void {
        $dataMap.events.forEach((e: (IDataMapEvent | null)) => {
            if (e) {
                const data = DEntitySpawner2.makeFromEventData(e, rmmzMapId);
                if (data) {
                    if (data.troopId > 0) {
                        SEntityFactory.spawnTroopAndMembers( MRData.troops[data.troopId], e.x, e.y,data.stateIds);
                    }
                    else {
                        if (data.entityId < 0) {
                            throw new Error("Invalid enity data.");
                        }
    
                        this.createEntityFromRmmzEvent(data, e.id, e.x, e.y);
                    }
                }
            }
        });
    }

    public static createEntityFromRmmzEvent(data: DEntityCreateInfo, eventId: number, x: number, y: number): LEntity {
        const entity = SEntityFactory.newEntity(data, MRLively.map.floorId());

        
        if (data.override) {
            entity.inhabitsCurrentFloor = true;
            entity.rmmzEventId = eventId;
        }

        // if (eventId == 19) {
        //     const unit = entity.getEntityBehavior(LUnitBehavior);
        //     unit.setFactionId(REData.system.factions.player);
        //     console.log("FACTION!!");
        // }
        //entity.rmmzEventId = eventId;
        //entity.inhabitsCurrentFloor = true;
        MRLively.world.transferEntity(entity, MRLively.map.floorId(), x, y);
        return entity;
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
        map.resetFromFullSize(width, height, 0, 0);

        for (let y = 0; y < map.innerHeight; y++) {
            for (let x = 0; x < map.innerWidth; x++) {
                const block = map.block(x, y);
                block.setTileShape(this.getTileShape(x, y));

                const regionId = this.getRegionId(x, y);
                if (regionId == paramFixedMapRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                }
                else if (regionId == paramFixedMapMonsterHouseRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                    block.setFixedMapMonsterHouseTypeId(MRBasics.monsterHouses.fixed);
                }
                else if (regionId == paramFixedMapItemShopRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                    block.setFixedMapItemShopTypeId(MRBasics.itemShops.fixed);
                }
                else if (regionId == paramFixedMapPassagewayRegionId) {
                    block.setComponent(FBlockComponent.Passageway);
                }
            }
        }
    }

    private static getTileShape(mx: number, my: number): LTileShape {
        if (Game_Map_Impl.checkPassage(mx, my, 0xF)) {

            const tiles = Game_Map_Impl.allTiles(mx, my);
            for (const t of tiles) {
                // RMMZ で壁オートタイル(A4)は、上面にあたる部分が必ず通行可能となる。
                // 単純に通行可否で TileShape を決定してしまうと、MRとして壁にしたい部分も床となってしまう。
                // そのため、A4 を一律 Wall 扱いする。
                if (DHelpers.isTileA4(t)) return LTileShape.HardWall;
            }

            return LTileShape.Floor;
        }
        else {
            return LTileShape.HardWall;
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

