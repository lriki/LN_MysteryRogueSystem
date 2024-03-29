import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { FBlockComponent, FMap } from "ts/mr/floorgen/FMapData";
import { MRLively } from "ts/mr/lively/MRLively";
import { LTileShape } from "ts/mr/lively/LBlock";
import { paramFixedMapItemShopRoomRegionId, paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId, paramRandomMapPaddingX, paramRandomMapPaddingY } from "ts/mr/PluginParameters";
import { SEntityFactory } from "./internal";
import { DEntityCreateInfo, DEntitySpawner } from "ts/mr/data/DSpawner";
import { LEntity } from "../lively/entity/LEntity";
import { DAnnotationReader, DRmmzPrefabAnnotation, DRmmzUniqueSpawnerAnnotation } from "../data/importers/DAnnotationReader";
import { DHelpers } from "../data/DHelper";
import { MRSystem } from "./MRSystem";



/**
 * RMMZ データ ($dataXXXX) に依存する処理。
 * これらは もともと rmmz フォルダ内 (RMMZIntegration 等) で定義していたが UnitTest でも使用する必要がでてきたため、
 * Visual レイヤーにアクセスする rmmz フォルダからは独立させたもの。
 */
export class SRmmzHelpers {

    static readEntityMetadata(event: Game_Event, rmmzMapId: number): DEntitySpawner | undefined {
        if (event._pageIndex >= 0) {
            const data = event.event();
            assert(data);
            return DEntitySpawner.makeFromEventPageData(data, event.page(), rmmzMapId);
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
                const data = DEntitySpawner.makeFromEventData(e, rmmzMapId);
                if (data) {
                    if (data.troopId > 0) {
                        SEntityFactory.spawnTroopAndMembers(MRLively.mapView.currentMap, MRData.troops[data.troopId], e.x, e.y,data.stateIds);
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

    /**
     * 指定したマップ内に存在している Game_Event のアクティブなページから、UnqueSpawner を取得します。
     * @param rmmzGameMap 
     * @returns 
     */
    public static getUnqueSpawners(rmmzGameMap: Game_Map): DEntitySpawner[] {
        const result: DEntitySpawner[] = [];
        for (const e of rmmzGameMap.events()) {
            if (e) {
                const annotation = DAnnotationReader.readUniqueSpawnerAnnotationFromPage(e.page());
                if (annotation) {
                    const spawner = DEntitySpawner.makeFromAnnotation(annotation);
                    spawner.mx = e.x;
                    spawner.my = e.y;
                    if (annotation.override) {
                        spawner.overrideRmmzEventMapId = rmmzGameMap.mapId();
                        spawner.overrideRmmzEventId = e.event().id;
                        spawner.overrideEvent = e.event();
                    }
                    result.push(spawner);
                }
            }
        }
        return result;
    }

    public static createEntityFromRmmzEvent(data: DEntityCreateInfo, eventId: number, x: number, y: number): LEntity {
        const entity = SEntityFactory.newEntity(data, MRLively.mapView.currentMap.floorId());

        if (data.override) {
            entity.inhabitsCurrentFloor = true;
            //this.linkEntityAndEvent(entity, event);
        }

        MRLively.world.transferEntity(entity, MRLively.mapView.currentMap.floorId(), x, y);
        return entity;
    }

    public static linkEntityAndEvent(entity: LEntity, event: Game_Event): void {
        entity.setRmmzEventId(event.eventId());
        event._MREntityId = entity.entityId().clone();
    }

    public static unlinkEntityAndEvent(entity: LEntity): void {
        const eventId = entity.rmmzEventId;
        if (eventId > 0) {
            const event = $gameMap.event(eventId);
            if (event) {
                event._MREntityId = undefined;
            }
        }
        entity.setRmmzEventId(0);
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

        let regionCount = 0;
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

                if (regionId > 0) {
                    regionCount++;
                }
            }
        }

        // region の指定が全く無いマップは、全てのブロックを Room にする
        if (regionCount == 0) {
            for (let y = 0; y < map.innerHeight; y++) {
                for (let x = 0; x < map.innerWidth; x++) {
                    const block = map.block(x, y);
                    block.setComponent(FBlockComponent.Room);
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

