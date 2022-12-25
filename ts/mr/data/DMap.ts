import { DMapId } from "./DCommon";

export enum REFloorMapKind {
    // データ定義用のマップ。ここへの遷移は禁止
    Land,

    TemplateMap,

    FixedMap,
    ShuffleMap,
    //RandomMap,
}


/**
 * マップデータ。RMMZ の MapInfo 相当で、その ID と一致する。
 * FloorInfo と似ているが、こちらは RMMZ Map に対する直接の追加情報を意味する。
 */
export class DMap {
    /** ID (0 is Invalid). */
    id: DMapId;

    /** Parent Land. */
    landId: number;

    /** RMMZ mapID. (0 is RandomMap) */
    mapId: number;

    /** マップ生成 */
    mapKind: REFloorMapKind;

    exitMap: boolean;

    /** 明示的な MRセーフティマップであるか */
    safetyMap: boolean;
    
    /** 非REシステムマップにおいて、RMMZオリジナルのメニューを使うか。(つまり、一切 RE システムと関係ないマップであるか) */
    defaultSystem: boolean;

    /** 明示的に RMMZ 標準マップとするか */
    eventMap: boolean;

    public constructor(id: DMapId) {
        this.id = id;
        this.landId = 0;
        this.mapId = 0;
        this.mapKind = REFloorMapKind.FixedMap;
        this.exitMap = false;
        this.safetyMap = false;
        this.defaultSystem = false;
        this.eventMap = false;
    }

    public get name(): string {
        const info = $dataMapInfos[this.mapId];
        if (!info) return "";
        return info.name;
    }
}

