import { DRmmzEffectScope } from "./DEffect";
import { DMapId } from "./DLand";
import { DTroopId } from "./DTroop";
import { REData } from "./REData";


export interface RMMZFloorMetadata {
    template?: string;
    displayName?: string;
    fixedMap?: string;
    safety?: boolean;
    bgm?: any[];
}

export interface RMMZEventPrefabMetadata {
    kind?: string;   // TODO: 必須にしてみる
    item?: string;
    enemy?: string;
    system?: string;

    // deprecated
    weaponId?: number;
    // deprecated
    armorId?: number;
    // deprecated
    itemId?: number;    // RMMZ データベース上の ItemId
    // deprecated
    enemyId?: number;   // RMMZ データベース上の EnemyId
}

interface RMMZEventRawMetadata {
    //prefab: string;
    data: string;
    states?: string[];
    troop?: string;
}


export interface RMMZEventEntityMetadata {
    
    data: string;

    states: string[];

    troopId: DTroopId;
}

interface RmmzREEventRawMetadata {
    trigger?: string;
}

export interface RmmzREEventMetadata {
    trigger?: string;
}

export class DHelpers {
    public static TILE_ID_E = 768;
    public static TILE_ID_A5 = 1536;
    public static TILE_ID_A1 = 2048;
    public static TILE_ID_A2 = 2816;
    public static TILE_ID_A3 = 4352;
    public static TILE_ID_A4 = 5888;
    public static TILE_ID_MAX = 8192;

    public static RmmzNormalMapLandId = 1;

    public static getMapName(mapId: DMapId): string {
        const info = $dataMapInfos[mapId];
        return info ? info.name : "";
    }

    public static getMapTopTile(mapData: IDataMap, x: number, y: number): number {
        for (let z = 3; z >= 0; z--) {
            const tile = mapData.data[(z * mapData.height + y) * mapData.width + x] || 0;
            if (tile > 0) return tile;
        }
        return 0;
    }

    public static isTileA3(tileId: number): boolean {
        return tileId >= this.TILE_ID_A3 && tileId < this.TILE_ID_A4;
    };
    
    public static isTileA4(tileId: number): boolean {
        return tileId >= this.TILE_ID_A4 && tileId < this.TILE_ID_MAX;
    };

    public static isAutotile(tileId: number): boolean {
        return tileId >= this.TILE_ID_A1;
    }

    public static getAutotileKind(tileId: number): number {
        //if (!this.isAutotile(tileId)) return 0;
        return Math.floor((tileId - this.TILE_ID_A1) / 48);
    }

    public static autotileKindToTileId(autotileKind: number): number {
        return autotileKind * 48 + this.TILE_ID_A1;
    }

    public static isWallSideAutoTile(autotileKind: number): boolean {
        const tileId = this.autotileKindToTileId(autotileKind);
        return (
            (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
            this.getAutotileKind(tileId) % 16 >= 8
        );
    }

    

    
    
    
    // Game_Action.prototype.checkItemScope
    private static checkItemScope(itemScope: DRmmzEffectScope, list: DRmmzEffectScope[]) {
        return list.includes(itemScope);
    }

    // Game_Action.prototype.isForOpponent
    public static isForOpponent(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Opponent_Single,
            DRmmzEffectScope.Opponent_All,
            DRmmzEffectScope.Opponent_Random_1,
            DRmmzEffectScope.Opponent_Random_2,
            DRmmzEffectScope.Opponent_Random_3,
            DRmmzEffectScope.Opponent_Random_4,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForAliveFriend
    public static isForAliveFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Alive,
            DRmmzEffectScope.Friend_All_Alive,
            DRmmzEffectScope.User,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForDeadFriend
    public static isForDeadFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Dead,
            DRmmzEffectScope.Friend_All_Dead]);
    }

    public static isForFriend(temScope: DRmmzEffectScope): boolean {
        return this.isForAliveFriend(temScope) || this.isForDeadFriend(temScope);
    }
    
    static readFloorMetadataFromPage(page: IDataMapEventPage, eventId: number): RMMZFloorMetadata | undefined {

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
    
            let index = comments.indexOf("@RE-Floor");
            if (index >= 0) {
                let block = comments.substring(index + 6);
                block = block.substring(
                    block.indexOf("{"),
                    block.indexOf("}") + 1);

                let rawData: RMMZFloorMetadata | undefined;
                eval(`rawData = ${block}`);

                return rawData;
            }
        }
        return undefined;
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
    
            let index = comments.indexOf("@RE-Entity");
            if (index >= 0) {
                let block = comments.substring(index + 6);
                block = block.substring(
                    block.indexOf("{"),
                    block.indexOf("}") + 1);

                let rawData: RMMZEventRawMetadata | undefined;
                eval(`rawData = ${block}`);

                if (rawData) {
                    if (!rawData.data && !rawData.troop) {
                        throw new Error(`Event#${eventId} - @RE-Entity not specified.`);
                    }
                    if (rawData.data && rawData.troop) {
                        throw new Error(`Event#${eventId} - It is not possible to specify both @RE-Entity.data and @RE-Entity.troop.`);
                    }

                    const rawData_ = rawData;
                    return {
                        data: rawData.data,
                        states: rawData.states ?? [],
                        troopId: rawData.troop ? REData.troops.findIndex(x => x.key == rawData_.troop) : 0,
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        return undefined;
    }

    static readREEventMetadataFromPage(page: IDataMapEventPage): RmmzREEventMetadata | undefined {

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
    
            let index = comments.indexOf("@RE-Event");
            if (index >= 0) {
                let block = comments.substring(index + 6);
                block = block.substring(
                    block.indexOf("{"),
                    block.indexOf("}") + 1);

                let rawData: RmmzREEventRawMetadata | undefined;
                eval(`rawData = ${block}`);

                if (rawData) {
                    const rawData_ = rawData;
                    return {
                        trigger: rawData_.trigger,
                    };
                }
                else {
                    return undefined;
                }
            }
        }
        return undefined;
    }

    static countSomeTilesRight_E(mapData: IDataMap, x: number, y: number): number {

        const findEvent = function(x: number, y: number): IDataMapEvent | undefined {
            for (const event of mapData.events) {
                if (event && event.x == x && event.y == y) {
                    return event;
                }
            }
            return undefined;
        }

        const baseTile = DHelpers.getMapTopTile(mapData, x, y);
        let x2 = x + 1;

        // 右へ伸びるタイルをカウントするときは E タイルのみを対象とする
        if (DHelpers.TILE_ID_E <= baseTile && baseTile < DHelpers.TILE_ID_A5) {
            for (; x2 < mapData.width; x2++) {
                if (baseTile != DHelpers.getMapTopTile(mapData, x2, y) || findEvent(x2, y)) {
                    
                    break;
                }
            }
        }

        return (x2 - 1) - x;
    }

    static makeRmmzMapDebugName(mapId: number) {
        return `${mapId}:${$dataMapInfos[mapId]?.name}`;
    }
    
    static isNode(): boolean {
        return (process.title !== 'browser');
    }
}