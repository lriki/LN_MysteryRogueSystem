import { DBasics } from "./DBasics";
import { DStateId } from "./DState";
import { REData } from "./REData";

export type DPrefabId = number;

/** Prefab の大分類 */
/*
export enum DPrefabKind {
    Unknown,
    Enemy,
    Trap,
    Item,
    System,
}
*/

/** どのデータテーブルの要素と関連づいているか */
export enum DPrefabDataSource {
    Unknown,
    Item,
    Enemy,
    System,
    Ornament,
}

export enum DSystemPrefabKind {
    Unknown,
    EntryPoint,
    ExitPoint,
}

export interface DPrefabImage {
    characterName: string;
    direction: number;
    pattern: number;
    characterIndex: number;
    
    directionFix: boolean;
    stepAnime: boolean;
    walkAnime: boolean;
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

/**
 * DPrefab
 * 
 * [2021/4/19] DPrefabKind といった enum で Enemy, Trap, Item などを分類していたのだが、厳しくなってきた。
 * 基本として真に種類を表すのは DItem など別のデータ構造の Kind フィールドなので、こちら側で種類を持つとデータの多重管理になる。
 * また、たくさんある Item の種類をどのくらいの粒度で interface 分けするべきなのかも手探り状態。（Item と Trap は DItem にまとめるか？分けるか？）
 * そのため Prefab 側で kind を持つのはやめて、メソッドでラップする。
 */
export class DPrefab {
    id: DPrefabId = 0;
    key: string = "";
    dataSource: DPrefabDataSource = DPrefabDataSource.Unknown;
    dataId: number = 0;
    image: DPrefabImage;
    subPages: DPrefabPageInfo[];
    stateImages: DPrefabStateImage[];

    public constructor() {
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
    }

    public isEnemyKind(): boolean {
        return this.dataSource == DPrefabDataSource.Enemy;
    }

    public isItemKind(): boolean {
        return this.dataSource == DPrefabDataSource.Item;
    }

    public isTrapKind(): boolean {
        return this.dataSource == DPrefabDataSource.Item && REData.itemEntity(this.dataId).entity.kindId == DBasics.entityKinds.TrapKindId;
    }

    public isEntryPoint(): boolean {
        return this.dataSource == DPrefabDataSource.System && this.dataId == DSystemPrefabKind.EntryPoint;
    }

    public isExitPoint(): boolean {
        return this.dataSource == DPrefabDataSource.System && this.dataId == DSystemPrefabKind.ExitPoint;
    }
}

