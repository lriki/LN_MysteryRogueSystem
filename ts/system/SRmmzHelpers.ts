import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { FBlockComponent, FMap } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { TileKind } from "ts/objects/REGame_Block";
import { LEntity } from "ts/objects/LEntity";
import { paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId } from "ts/PluginParameters";
import { REEntityFactory } from "./REEntityFactory";
import { SBehaviorFactory } from "./SBehaviorFactory";

interface RMMZEventRawMetadata {
    prefab: string;
    states?: string[];
}

export interface RMMZEventEntityMetadata {
    /**
     * Entity Prefab の種別。EntityFactory から生成するためのキー。
     * 
     * 固定マップなどで明示的にイベントから生成される Entity は、必ず Prefab が必要。
     * これが無いと、拾われる → 置かれた の時に、Map 上に出現したときにどの Prefab を元に
     * RMMZ イベントを作ればよいのかわからなくなるため。
     */
    prefab: string;

    states: string[];
}

export interface RMMZEventPrefabMetadata {
    item?: string;
    enemy?: string;

    // deprecated
    weaponId?: number;
    // deprecated
    armorId?: number;
    // deprecated
    itemId?: number;    // RMMZ データベース上の ItemId
    // deprecated
    enemyId?: number;   // RMMZ データベース上の EnemyId
}

/**
 * RMMZ データ ($dataXXXX) に依存する処理。
 * これらは もともと rmmz フォルダ内 (RMMZIntegration 等) で定義していたが UnitTest でも使用する必要がでてきたため、
 * Visual レイヤーにアクセスする rmmz フォルダからは独立させたもの。
 */
export class SRmmzHelpers {

    static readEntityMetadata(event: Game_Event): RMMZEventEntityMetadata | undefined {
        if (event._pageIndex >= 0) {
            return this.readEntityMetadataFromPage(event.page(), event.eventId());
        }
        else {
            return undefined;
        }
    }

    static readEntityMetadataFromPage(page: IDataMapEventPage, eventId: number): RMMZEventEntityMetadata | undefined {

        let list = page.list;
        if (list) {
            // collect comments
            let comments = "";
            for (let i = 0; i < list.length; i++) {
                if (list[i].code == 108 || list[i].code == 408) {
                    if (list[i].parameters) {
                        comments += list[i].parameters;
                    }
                }
            }
    
            let index = comments.indexOf("@REEntity");
            if (index >= 0) {
                let block = comments.substring(index + 6);
                block = block.substring(
                    block.indexOf("{"),
                    block.indexOf("}") + 1);

                let rawData: RMMZEventRawMetadata | undefined;
                eval(`rawData = ${block}`);

                if (rawData) {
                    if (!rawData.prefab) {
                        throw new Error(`Event#${eventId} - @REEntity.prefab not specified.`);
                    }
                    return {
                        prefab: rawData.prefab,
                        states: rawData.states ?? [],
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        return undefined;
    }
    

    public static isItemPrefab(data: RMMZEventPrefabMetadata): boolean {
        return !!data.itemId;
    }

    public static isExitPointPrefab(data: RMMZEventEntityMetadata): boolean {
        return data.prefab.includes("ExitPoint");
    }

    static readPrefabMetadata(event: IDataMapEvent): RMMZEventPrefabMetadata | undefined {
        if (event.pages && event.pages.length > 0) {
            const page = event.pages[0];
            const list = page.list;
            if (list) {
                // collect comments
                let comments = "";
                for (let i = 0; i < list.length; i++) {
                    if (list[i].code == 108 || list[i].code == 408) {
                        if (list[i].parameters) {
                            comments += list[i].parameters;
                        }
                    }
                }
        
                let index = comments.indexOf("@REPrefab");
                if (index >= 0) {
                    let block = comments.substring(index + 6);
                    block = block.substring(
                        block.indexOf("{"),
                        block.indexOf("}") + 1);

                    let metadata: RMMZEventPrefabMetadata | undefined;
                    eval(`metadata = ${block}`);
                    return metadata;
                }
            }
        }
        return undefined;
    }
    // こちらは UnitTest 用。Game_Event は使えないので $dataMap から、最初のイベントページ固定で作る
    public static createEntitiesFromRmmzFixedMapEventData(): void {
        $dataMap.events.forEach((e: IDataMapEvent) => {
            if (e && e.pages.length > 0) {
                const metadata = SRmmzHelpers.readEntityMetadataFromPage(e.pages[0], e.id);
                if (metadata) {
                    this.createEntityFromRmmzEvent(metadata, e.id, e.x, e.y);
                }
            }
        });
    }
    public static createEntityFromRmmzEvent(metadata: RMMZEventEntityMetadata, eventId: number, x: number, y: number): void {
        const entity = this.newEntity(metadata);
        entity.prefabKey =metadata.prefab;
        entity.rmmzEventId = eventId;
        entity.inhabitsCurrentFloor = true;
        REGame.world._transferEntity(entity, REGame.map.floorId(), x, y);
        assert(entity.ownerIsMap());

        // 初期 state 付与
        // TODO: 絶対に眠らないモンスターとかもいるので、Command にしたほうがいいかも。
        metadata.states.forEach(stateKey => {
            entity.addState(REData.states.findIndex(state => state.key == stateKey));
        });
    }


    public static getPrefabEventData(prefabName: string): IDataMapEvent {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);

        const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabName : false);
        if (index >= 0) {
            return databaseMap.events[index];
        }
        else {
            throw new Error(`${prefabName} not found in REDatabase map.`);
        }
    }
    
    public static newEntity(data: RMMZEventEntityMetadata): LEntity {
        const prefabEventData = this.getPrefabEventData(data.prefab);
        const prefabData = this.readPrefabMetadata(prefabEventData);    // TODO: 毎回パースするとパフォーマンスに影響でそうなのでキャッシュしたいところ
        assert(prefabData);

        if (this.isExitPointPrefab(data)) {
            return REEntityFactory.newExitPoint();
        }

        if (prefabData.item) {
            const data = REData.items.find(x => x.entity.key == prefabData.item);
            if (data) {
                let entity;
                if (data.entity.kind == "Weapon")
                    entity = REEntityFactory.newEquipment(data.id);
                else if (data.entity.kind == "Shield")
                    entity = REEntityFactory.newEquipment(data.id);
                else if (data.entity.kind == "Trap")
                    entity = REEntityFactory.newTrap(data.id);
                else
                    entity = REEntityFactory.newItem(data.id);
                
                SBehaviorFactory.attachBehaviors(entity, data.entity.behaviors);
                return entity;
            }
            else
                throw new Error("Invalid item key: " + prefabData.item);
        }

        if (prefabData.enemy) {
            const data = REData.monsters.find(x => x.key == prefabData.enemy);
            if (data)
                return REEntityFactory.newMonster(data.id);
            else
                throw new Error("Invalid enemy key: " + prefabData.enemy);
        }

        throw new Error("Invalid prefab data key: " + prefabEventData.name);

        /*
        switch (data.prefabKind) {
            case "":
                return REEntityFactory.newEquipment((prefabData.weaponId ?? 0) + REData.weaponDataIdOffset);
            case "":
            case "Ring":
                return REEntityFactory.newEquipment((prefabData.armorId ?? 0) + REData.armorDataIdOffset);
            case 
                
            default:
                throw new Error("Invalid entity name: " + data.prefabKind);
        }
        */
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
        REGame.minimapData.reset(width, height);

        for (let y = 0; y < map.height(); y++) {
            for (let x = 0; x < map.width(); x++) {
                const block = map.block(x, y);

                if (Game_Map_Impl.checkPassage(x, y, 0xF)) {
                    block.setTileKind(TileKind.Floor);
                }
                else {
                    block.setTileKind(TileKind.HardWall);
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

