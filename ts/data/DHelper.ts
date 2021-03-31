

export interface RMMZFloorMetadata {
    fixedMap?: string;
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
    public static TILE_ID_A1 = 2048;

    public static getMapTopTile(mapData: IDataMap, x: number, y: number): number {
        for (let z = 3; z >= 0; z--) {
            const tile = mapData.data[(z * mapData.height + y) * mapData.width + x] || 0;
            if (tile > 0) return tile;
        }
        return 0;
    }

    public static isAutotile(tileId: number) {
        return tileId >= this.TILE_ID_A1;
    };

    public static getAutotileKind(tileId: number): number {
        //if (!this.isAutotile(tileId)) return 0;
        return Math.floor((tileId - this.TILE_ID_A1) / 48);
    };
    
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
    
}