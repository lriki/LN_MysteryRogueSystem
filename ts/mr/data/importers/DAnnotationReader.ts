import { assert, tr2 } from "../../Common";
import { DFloorMode } from "../DLand";
import { DTroopId } from "../DTroop";
import { MRData } from "../MRData";

// @MR-Land
export interface DRmmzLandAnnotation {
    identifications?: string[];
}

/** @deprecated */
export interface RmmzStructuresMetadata {
}

// @MR-Floor
export interface DRmmzFloorRawAnnotation {
    template?: string;
    displayName?: string;
    fixedMap?: string;
    safety?: boolean;
    bgm?: any[];
    preset?: string;
    unique?: boolean;
    fovSystem?: string;
    mode?: string;
}

// @MR-Prefab
export interface DRmmzPrefabAnnotation {
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

// @MR-PrefabSubPage
export interface DRmmzPrefabSubPageAnnotation {
    state?: string;
}

interface DRmmzSpawnerRawAnnotation {
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
    name?: string;
    reactions?: { key: string, name: string }[];
}

// @MR-Spawner
export interface DRmmzSpawnerAnnotation {
    entity: string;
    states: string[];
    troopId: DTroopId;
    stackCount: number | undefined;
    override: boolean;
    overrideEvent: boolean;
    keeper: boolean;
    gold: number;
    rate: number;
    name?: string;
    reactions?: { key: string, name: string }[];
}

// @MR-UniqueSpawner
export interface DRmmzUniqueSpawnerAnnotation {
    entityKey: string;
    moveType: string;
    override: boolean;
}

export interface DRmmzREEventAnnotation {
    trigger?: string;
    condition_state?: string;
    //conditions?: {
    //    state?: string,
    //}
}

// @MR-TemplatePart
export interface DRmmzTemplatePartAnnotation {
    type?: string;
    height?: number;
    placement?: string;
}

// @MR-Troop
export interface DRmmzTroopAnnotation {
    key: string;
}

export interface DRmmzEventListItem { 
    code: number;
    indent: number;
    parameters: string[];
}

export class DAnnotationReader {

    public static findFirstAnnotationFromEvent(annotation: string, event: IDataMapEvent): string | undefined {
        return this.findFirstAnnotationFromPage(annotation, event.pages[0].list);
    }

    public static findFirstAnnotationFromPage(annotation: string, list: DRmmzEventListItem[]): string | undefined {
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
        const block = this.findFirstAnnotationFromPage(annotation, event.pages[0].list);
        if (!block) return undefined;
        let rawData: DRmmzPrefabAnnotation | undefined;
        try {
            eval(`rawData = ${block}`);
            assert(rawData);
        }
        catch (e: any) {
            throw new Error(tr2("%1の構文エラーです。").format(annotation) + `\nMap:${rmmzMapId},Event:${event.id},${event.name}` + "\n" + e.toString());
        }
        return rawData;
    }

    public static readLandAnnotation(event: IDataMapEvent): DRmmzLandAnnotation | undefined {
        const block = this.findFirstAnnotationFromEvent("@MR-Land", event);
        if (!block) return undefined;
        let rawData: DRmmzLandAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    public static readFloorAnnotationFromPage(page: IDataMapEventPage): DRmmzFloorRawAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Floor", page.list);
        if (!block) return undefined;
        let rawData: DRmmzFloorRawAnnotation | undefined;
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
    
    public static readPrefabAnnotation(event: IDataMapEvent, rmmzMapId: number): DRmmzPrefabAnnotation | undefined {
        const rawData = this.tryGetAnnotationFromEvent("@MR-Prefab", event, rmmzMapId);
        if (!rawData) return undefined;
        assert(rawData);
        return rawData;
    }
    
    public static readPrefabSubPageAnnotation(page: IDataMapEventPage): DRmmzPrefabSubPageAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-PrefabSubPage", page.list);
        if (!block) return undefined;
        let rawData: DRmmzPrefabSubPageAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    public static readSpawnerAnnotationFromPage(page: IDataMapEventPage): DRmmzSpawnerAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Spawner", page.list);
        if (!block) return undefined;
        let rawData: DRmmzSpawnerRawAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        const rawData_ = rawData;
        return {
            entity: rawData.entity ? (rawData.entity ?? "") : (rawData.data ?? ""),
            states: rawData.states ?? [],
            troopId: rawData.troop ? MRData.troops.findIndex(x => x.key == rawData_.troop) : 0,
            stackCount: rawData.stack,
            override: rawData.override ?? false,
            overrideEvent: rawData.overrideEvent ?? false,
            keeper: rawData.keeper ?? false,
            gold: rawData.gold ?? 0,
            rate: rawData.rate ?? 100,
            name: rawData.name,
            reactions: rawData.reactions,
        };
    }

    public static readUniqueSpawnerAnnotationFromPage(page: IDataMapEventPage): DRmmzUniqueSpawnerAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-UniqueSpawner", page.list);
        if (!block) return undefined;
        let rawData: {
            entityKey?: string;
            moveType?: string;
            override?: boolean;
        } | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return {
            entityKey: rawData.entityKey ?? "",
            moveType: rawData.moveType ?? "",
            override: rawData.override ?? false,
        };
    }

    static readREEventAnnotationFromPage(page: IDataMapEventPage): DRmmzREEventAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Event", page.list);
        if (!block) return undefined;
        let rawData: DRmmzREEventAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    static readTemplatePartAnnotationFromPage(page: IDataMapEventPage): DRmmzTemplatePartAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-TemplatePart", page.list);
        if (!block) return undefined;
        let rawData: DRmmzTemplatePartAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }

    static readTroopAnnotationFromPage(page: IDataPage): DRmmzTroopAnnotation | undefined {
        const block = this.findFirstAnnotationFromPage("@MR-Troop", page.list);
        if (!block) return undefined;
        let rawData: DRmmzTroopAnnotation | undefined;
        eval(`rawData = ${block}`);
        assert(rawData);
        return rawData;
    }
}
