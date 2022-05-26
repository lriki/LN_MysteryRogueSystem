import { assert, tr2 } from "../Common";
import { DTroopId } from "./DTroop";
import { REData } from "./REData";


export interface RmmzLandAttribute {
    identifications?: string[];
}

/** @deprecated */
export interface RmmzStructuresMetadata {
}

export interface RmmzFloorRawAttribute {
    template?: string;
    displayName?: string;
    fixedMap?: string;
    safety?: boolean;
    bgm?: any[];
    preset?: string;
}

/*
export interface RmmzEventPrefabStateImage {
    characterName: string;
    characterIndex: number;
}
*/

export interface RmmzEventPrefabAttribute {
    // kind?: string;   // TODO: 必須にしてみる
    // item?: string;
    // enemy?: string;
    // system?: string;

    stateImages?: any[]; // [stateId, characterName, characterIndex]

    //projectilePage?: string;    // Projectile として移動中にアクティブになるイベントページ (1~)

    // // deprecated
    // weaponId?: number;
    // // deprecated
    // armorId?: number;
    // // deprecated
    // itemId?: number;    // RMMZ データベース上の ItemId
    // // deprecated
    // enemyId?: number;   // RMMZ データベース上の EnemyId


}

export interface RmmzEventPrefabSubPageAttribute {
    state?: string;
}

interface RmmzSpawnerRawAttribute {
    data?: string;

    /** @deprecated use data */
    entity?: string;

    states?: string[];
    troop?: string;     // TODO: data と混ぜていいかも
    stack?: number;

    // true を指定すると、このイベントにより生成された Entity は
    // 動的イベントを生成するのではなく、生成元のイベントを参照するようになる。
    // この機能は主に街の人との会話イベントを、普通にツクールを使うのと同じように作れるようにするためのもの。
    // 本来であれば街の人を Unique にして Prefab も作っておき、Prefab 側で会話イベント実行内容を書くべき。
    // でも看板など基本的に他マップに持ち出せないような Entity もあり、そういったものに対しても Prefab 側で色々設定するのは面倒。
    override?: boolean;

    overrideEvent?: boolean;

    keeper?: boolean;
    
    gold?: number;

    rate?: number;
}


export interface RmmzSpawnerAttribute {
    entity: string;

    states: string[];

    troopId: DTroopId;

    stackCount: number;

    override: boolean;

    overrideEvent: boolean;

    keeper: boolean;

    gold: number;

    rate: number;
}

interface RmmzREEventRawAttribute {
    trigger?: string;
    condition_state?: string;
    //conditions?: {
    //    state?: string,
    //}
}

export interface RmmzREEventAttribute {
    trigger?: string;
    condition_state?: string;
    //conditions?: {
    //    state?: string,
    //}
}

export class DAnnotationReader {

    public static findFirstAnnotationFromEvent(annotation: string, event: IDataMapEvent): string | undefined {
        return this.findFirstAnnotationFromPage(annotation, event.pages[0]);
    }

    public static findFirstAnnotationFromPage(annotation: string, page: IDataMapEventPage): string | undefined {
        let list = page.list;
        if (list) {
            // Collect comments.
            let comments = "";
            let inAnno = false;
            let found = false;
            for (let i = 0; i < list.length; i++) {
                if (!inAnno) {
                    if (list[i].code == 108) {
                        const comment: string = list[i].parameters[0];
                        if (comment.includes(annotation)) {
                            inAnno = true;
                            found = true;
                        }
                    }
                }
                else {
                    if (list[i].code == 108) {
                        inAnno = false;
                    }
                    else if (list[i].code == 408) {
                        comments += list[i].parameters;
                    }
                }
            }
    
            if (found) {
                return `{${comments}}`;
            } 

            // // Find annotation block.
            // let index = comments.indexOf(annotation);
            // if (index >= 0) {
            //     let block = comments.substring(index + annotation.length);
            //     //block = block.substring(
            //         //block.indexOf("{"),
            //     //    block.indexOf("}") + 1);
            //     return `{${block}}`;
            // }
        }
        return undefined;
    }
    
    public static tryGetAnnotationFromEvent(annotation: string, event: IDataMapEvent, rmmzMapId: number): any | undefined {
        const block = this.findFirstAnnotationFromPage(annotation, event.pages[0]);
        if (!block) return undefined;
        let rawData: RmmzEventPrefabAttribute | undefined;
        try {
            eval(`rawData = ${block}`);
            assert(rawData);
        }
        catch (e: any) {
            throw new Error(tr2("%1の構文エラーです。").format(annotation) + `\nMap:${rmmzMapId},Event:${event.id},${event.name}` + "\n" + e.toString());
        }
        return rawData;
    }

    public static readLandMetadata(event: IDataMapEvent): RmmzLandAttribute | undefined {
        const block = this.findFirstAnnotationFromEvent("@MR-Land", event);
        if (!block) return undefined;
        let rawData: RmmzLandAttribute | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    /** @deprecated */
    public static readStructuresMetadata(event: IDataMapEvent): RmmzStructuresMetadata | undefined {
        const block = this.findFirstAnnotationFromEvent("@MR-Structures", event);
        if (!block) return undefined;
        let rawData: RmmzStructuresMetadata | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }
    
    public static readPrefabMetadata(event: IDataMapEvent, rmmzMapId: number): RmmzEventPrefabAttribute | undefined {
        const rawData = this.tryGetAnnotationFromEvent("@MR-Prefab", event, rmmzMapId);
        if (!rawData) return undefined;
        assert(rawData);
        return rawData;
    }
    
    public static readPrefabSubPageMetadata(page: IDataMapEventPage): RmmzEventPrefabSubPageAttribute | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-PrefabSubPage", page);
        if (!block) return undefined;
        let rawData: RmmzEventPrefabSubPageAttribute | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    public static readEntityMetadataFromPage(page: IDataMapEventPage): RmmzSpawnerAttribute | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Spawner", page);
        if (!block) return undefined;
        let rawData: RmmzSpawnerRawAttribute | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        const rawData_ = rawData;
        return {
            entity: rawData.entity ? (rawData.entity ?? "") : (rawData.data ?? ""),
            states: rawData.states ?? [],
            troopId: rawData.troop ? REData.troops.findIndex(x => x.key == rawData_.troop) : 0,
            stackCount: rawData.stack ?? 1,
            override: rawData.override ?? false,
            overrideEvent: rawData.overrideEvent ?? false,
            keeper: rawData.keeper ?? false,
            gold: rawData.gold ?? 0,
            rate: rawData.rate ?? 100,
        };
    }

    public static readFloorMetadataFromPage(page: IDataMapEventPage): RmmzFloorRawAttribute | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Floor", page);
        if (!block) return undefined;
        let rawData: RmmzFloorRawAttribute | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return {
            template: rawData.template,
            displayName: rawData.displayName,
            fixedMap: rawData.fixedMap,
            safety: rawData.safety,
            bgm: rawData.bgm,
            preset: rawData.preset,
        };
    }

    static readREEventMetadataFromPage(page: IDataMapEventPage): RmmzREEventAttribute | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Event", page);
        if (!block) return undefined;
        let rawData: RmmzREEventRawAttribute | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        const rawData_ = rawData;
        return {
            trigger: rawData_.trigger,
            condition_state: rawData_.condition_state,
        };
    }
}
