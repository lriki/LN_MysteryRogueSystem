import { REBasics } from "./REBasics";
import { DStateId } from "./DState";
import { REData } from "./REData";

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
 * DPrefab
 * 
 * [2021/4/19] DPrefabKind といった enum で Enemy, Trap, Item などを分類していたのだが、厳しくなってきた。
 * 基本として真に種類を表すのは DItem など別のデータ構造の Kind フィールドなので、こちら側で種類を持つとデータの多重管理になる。
 * また、たくさんある Item の種類をどのくらいの粒度で interface 分けするべきなのかも手探り状態。（Item と Trap は DItem にまとめるか？分けるか？）
 * そのため Prefab 側で kind を持つのはやめて、メソッドでラップする。
 */
export class DPrefab {
    /*
    DPrefab
    
    [2021/4/19]
    ----------
    DPrefabKind といった enum で Enemy, Trap, Item などを分類していたのだが、厳しくなってきた。
    基本として真に種類を表すのは DItem など別のデータ構造の Kind フィールドなので、こちら側で種類を持つとデータの多重管理になる。
    また、たくさんある Item の種類をどのくらいの粒度で interface 分けするべきなのかも手探り状態。（Item と Trap は DItem にまとめるか？分けるか？）
    そのため Prefab 側で kind を持つのはやめて、メソッドでラップする。
    
    [2021/9/18]
    ----------
    このデータは本来、Data-Layer と View-Layer ２つの情報に分けるべきかも。
    */

    id: DPrefabId = 0;
    key: string = "";
    image: DPrefabActualImage;
    subPages: DPrefabPageInfo[];
    stateImages: DPrefabStateImage[];

    /** DownSequel のイメージ */
    downImage: DPrefabOverrideImage;

    moveType: DPrefabMoveType;

    rmmzMapId: number;
    rmmzEventData: IDataMapEvent;

    public constructor(id: DPrefabId) {
        this.id = id;
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

