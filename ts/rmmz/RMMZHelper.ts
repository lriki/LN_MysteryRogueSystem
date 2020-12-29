

export interface RMMZEventEntityMetadata {
    /**
     * Entity Prefab の種別。EntityFactory から生成するためのキー。
     * 
     * 固定マップなどで明示的にイベントから生成される Entity は、必ず Prefab が必要。
     * これが無いと、拾われる → 置かれた の時に、Map 上に出現したときにどの Prefab を元に
     * RMMZ イベントを作ればよいのかわからなくなるため。
     */
    prefabKind: string;
    prefabIndex: number;

    states: string[];
}

interface RMMZEventRawMetadata {
    prefab: string;
    states: string[];
}


export interface RMMZEventPrefabMetadata {
    itemId?: number;    // RMMZ データベース上の ItemId
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
    
                        const tokens = rawData.prefab.split(":");

                        return {
                            prefabKind: tokens[0],
                            prefabIndex: Number(tokens[1]),
                            states: rawData.states,
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
}

