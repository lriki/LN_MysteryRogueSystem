

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

interface RMMZEventRawMetadata {
    prefab: string;
    states?: string[];
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

export class RMMZHelper {
    static readEntityMetadata(event: Game_Event): RMMZEventEntityMetadata | undefined {

        if (event._pageIndex >= 0) {
            let list = event.list();
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
                            throw new Error(`Event#${event.eventId()} - @REEntity.prefab not specified.`);
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

    public static isExitPointPrefab(data: RMMZEventEntityMetadata): boolean {
        return data.prefab.includes("ExitPoint");
    }

    public static isItemPrefab(data: RMMZEventPrefabMetadata): boolean {
        return !!data.itemId;
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

    public static setRegionId(x: number, y: number, regionId: number): void {
        if ($dataMap.data) {
            const width = $dataMap.width ?? 0;
            const height = $dataMap.height ?? 0;
            $dataMap.data[(5 * height + y) * width + x] = regionId;
        }
    }



    // https://www.f-sp.com/category/RPG%E3%83%84%E3%82%AF%E3%83%BC%E3%83%AB?page=1480575168
    // 異種タイルが 1
    public static _autoTileTable: number[] = [
        0b000000000, // tileId: 0
        0b001000000, // tileId: 1
        0b100000000, // tileId: 2
        0b101000000, // tileId: 3
        0b000000100, // tileId: 4
        0b001000100, // tileId: 5
        0b100000100, // tileId: 6
        0b101000100, // tileId: 7
        
        0b000000001, // tileId: 8
        0b001000001, // tileId: 9
        0b100000001, // tileId: 10
        0b101000001, // tileId: 11
        0b000000101, // tileId: 12
        0b001000101, // tileId: 13
        0b100000101, // tileId: 14
        0b101000101, // tileId: 15
        
        0b001001001, // tileId: 16
        0b101001001, // tileId: 17
        0b001001101, // tileId: 18
        0b101001101, // tileId: 19
        0b111000000, // tileId: 20
        0b111000100, // tileId: 21
        0b111000001, // tileId: 22
        0b111000101, // tileId: 23
        
        0b100100100, // tileId: 24
        0b100100101, // tileId: 25
        0b101100100, // tileId: 26
        0b101100101, // tileId: 27
        0b000000111, // tileId: 28
        0b001000111, // tileId: 29
        0b100000111, // tileId: 30
        0b101000111, // tileId: 31

        
        0b101101101, // tileId: 0
        0b111000111, // tileId: 0
        0b111100100, // tileId: 0
    ];
    
    public static mapAutoTileId(dirBits: number): number {
        const index = this._autoTileTable.findIndex(x => x == dirBits);
        if (index >= 0)
            return index;
        else 
            return 0;
    }
}

