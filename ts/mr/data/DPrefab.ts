import { MRBasics } from "./MRBasics";
import { DStateId } from "./DState";
import { MRData } from "./MRData";
import { DScript } from "./DScript";

export type DPrefabId = number;

export enum DSystemPrefabKind {
    Unknown,
    EntryPoint,
    ExitPoint,
}

export interface DPrefabActualImage {
    characterName: string;
    direction: number;
    pattern: number;
    characterIndex: number;
    
    directionFix: boolean;
    stepAnime: boolean;
    walkAnime: boolean;
}

export interface DPrefabOverrideImage {
    characterName?: string;
    characterIndex?: number;
    direction?: number;
    pattern?: number;
    directionFix?: boolean;
    stepAnime?: boolean;
    walkAnime?: boolean;
}

export interface DPrefabStateImage {
    stateId: DStateId;
    characterName: string;
    characterIndex: number;
};

export interface DPrefabPageInfo {
    stateId: DStateId,
    rmmzEventPageIndex: number,
}

export enum DPrefabMoveType {
    Fix,
    Random,
}

/**
 * プレハブデータ
 */
export class DPrefab {
    public readonly id: DPrefabId;
    public readonly key: string;
    image: DPrefabActualImage;
    subPages: DPrefabPageInfo[];
    scripts: DScript[];
    stateImages: DPrefabStateImage[];

    /** DownSequel のイメージ */
    downImage: DPrefabOverrideImage;

    moveType: DPrefabMoveType;

    // ランダムマップに配置される Entity と、Lang テーブル内で定義した RMMZ Event を関連付けたい場合がある。
    // 例えば、イベント用の階段や NPC。
    // 固定マップを使っている場合等は Land 定義マップが固定マップと異なる RMMZ マップとなるため、参照したければ Land マップのロードが必要になってしまう。
    // RMMZ Evnet のデータをあらかじめ取り出しておくことで対策する。
    rmmzMapId: number;
    rmmzEventData: IDataMapEvent;

    public constructor(id: DPrefabId, key: string) {
        this.id = id;
        this.key = key;
        this.image = {
            characterName: "",
            direction: 2,
            pattern: 0,
            characterIndex: 0,
            directionFix: false,
            stepAnime: false,
            walkAnime: false,
        };
        this.subPages = [];
        this.scripts = [];
        this.stateImages = [];
        this.downImage = {};
        this.moveType = DPrefabMoveType.Random;
        this.rmmzMapId = 0;
        this.rmmzEventData = {
            id: 0,
            name: "null",
            note: "",
            pages: [
                {
                    conditions: {
                        actorId: 1,
                        actorValid: false,
                        itemId: 1,
                        itemValid: false,
                        selfSwitchCh: "A",
                        selfSwitchValid: false,
                        switch1Id: 1,
                        switch1Valid: false,
                        switch2Id: 1,
                        switch2Valid: false,
                        variableId: 1,
                        variableValid: false,
                        variableValue: 1,
                    },
                    directionFix: false,
                    image: {
                        tileId: 0,
                        characterName: "",
                        direction: 2,
                        pattern: 0,
                        characterIndex: 1
                    },
                    list: [],
                    moveFrequency: 3,
                    moveRoute: {
                        list: [],
                        repeat: true,
                        skippable: false,
                        wait: false,
                    },
                    moveSpeed: 3,
                    moveType: 0,
                    priorityType: 1,
                    stepAnime: false,
                    through: false,
                    trigger: 0,
                    walkAnime: true,
                }
            ],
            x: 0,
            y: 0,
        };;
    }

    // public isEnemyKind(): boolean {
    //     return this.dataSource == DPrefabDataSource.Enemy;
    // }

    // public isItemKind(): boolean {
    //     return this.dataSource == DPrefabDataSource.Item;
    // }

    // public isTrapKind(): boolean {
    //     return this.dataSource == DPrefabDataSource.Item && REData.itemEntity(this.dataId).entity.kindId == REBasics.entityKinds.TrapKindId;
    // }

    // public isEntryPoint(): boolean {
    //     return this.dataSource == DPrefabDataSource.System && this.dataId == DSystemPrefabKind.EntryPoint;
    // }

    // public isExitPoint(): boolean {
    //     return this.dataSource == DPrefabDataSource.System && this.dataId == DSystemPrefabKind.ExitPoint;
    // }
}

