
export interface RMMZEventEntityMetadata {
    /** Entity Prefab の種別。EntityFactory から生成するためのキー。 */
    entity?: string;

    enemyId?: number;
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

                    let metadata: RMMZEventEntityMetadata = {};
                    eval(`metadata = ${block}`);
                    return metadata;
                }
            }
        }
        return undefined;
    }
}

