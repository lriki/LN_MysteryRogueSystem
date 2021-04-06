

export interface RMMZFloorMetadata {
    fixedMap?: string;
}

export interface RMMZEventPrefabMetadata {
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

export class DHelpers {
    public static TILE_ID_A5 = 1536;
    public static TILE_ID_A1 = 2048;
    public static TILE_ID_A2 = 2816;
    public static TILE_ID_A3 = 4352;
    public static TILE_ID_A4 = 5888;
    public static TILE_ID_MAX = 8192;

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
                    if (!rawData.prefab) {
                        throw new Error(`Event#${eventId} - @RE-Entity.prefab not specified.`);
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
    
}