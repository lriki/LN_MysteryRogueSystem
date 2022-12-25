import { assert } from "../Common";
import { DLand } from "./DLand";
import { DMap } from "./DMap";
import {  MRData } from "./MRData";
import { MRDataManager } from "./MRDataManager";


export enum DMapDataNodeRootType {
    LandLike,   // Land or World
    MapTemplates,
}

export enum DLandMapDataDirectory {
    Table,
    System,
    Event,
    Shuffle,
    Fixed,
}

export enum DMapDataNodeLeafType {
    //Root,   // 検索を開始した Map がいずれかの Root だった
    RootOrDirctory,   // 検索を開始した Map がいずれかの Directory だった
    Generic,
    Table_Event,
    Table_Enemy,
    Table_Item,
    Table_Trap,
    Table_Shop,
    Table_Shop_Peddler,     // 行商人アイテム
    Table_Shop_Weapon,      // 専門店アイテム (武器)
    Table_Shop_Luxury,      // 高級店アイテム
    Table_RandomPot,   // 変化の壺
    System_ExitMap,
}

enum DMapDataNodeType {

}

export interface DMapDataNodeInfo {
    rootType: DMapDataNodeRootType | undefined;
    leafType: DMapDataNodeLeafType;
    directory: DLandMapDataDirectory | undefined;
    landRmmzMapId: number | undefined;
}

export class DDataImporter {

    public static getMapDataNodeInfo(rmmzMapId: number): DMapDataNodeInfo {
        // assert(mapInfo);
        // let parentMapId = mapInfo.parentId;
        const info: DMapDataNodeInfo = {
            rootType: undefined,
            directory: undefined,
            leafType: DMapDataNodeLeafType.Generic,
            landRmmzMapId: undefined,
        };
        let count = 0;
        while (rmmzMapId > 0) {
            let mapInfo = $dataMapInfos[rmmzMapId];
            assert(mapInfo);

            // rootType
            if (MRDataManager.isLandMap(rmmzMapId)) {
                info.rootType = DMapDataNodeRootType.LandLike;
                info.landRmmzMapId = mapInfo.id;
            }
            else if (mapInfo.name.includes("MR-MapTemplates")) {
                info.rootType = DMapDataNodeRootType.MapTemplates;
            }
            if (count == 0 && info.rootType !== undefined) {
                info.leafType = DMapDataNodeLeafType.RootOrDirctory;
            }

            // directory
            if (mapInfo.name.includes("[Table]")) {
                info.directory = DLandMapDataDirectory.Table;
            }
            else if (mapInfo.name.includes("[System]")) {
                info.directory = DLandMapDataDirectory.System;
            }
            else if (mapInfo.name.includes("[Event]")) {
                info.directory = DLandMapDataDirectory.Event;
            }
            else if (mapInfo.name.includes("[Shuffle]")) {
                info.directory = DLandMapDataDirectory.Shuffle;
            }
            else if (mapInfo.name.includes("[Fixed]")) {
                info.directory = DLandMapDataDirectory.Fixed;
            }
            if (count == 0 && info.directory !== undefined) {
                info.leafType = DMapDataNodeLeafType.RootOrDirctory;
            }

            // leafType
            if (count == 0) {
                if (mapInfo.name == "Event") {
                    info.leafType = DMapDataNodeLeafType.Table_Event;
                }
                else if (mapInfo.name == "Enemy") {
                    info.leafType = DMapDataNodeLeafType.Table_Enemy;
                }
                else if (mapInfo.name == "Item") {
                    info.leafType = DMapDataNodeLeafType.Table_Item;
                }
                else if (mapInfo.name == "Trap") {
                    info.leafType = DMapDataNodeLeafType.Table_Trap;
                }
                else if (mapInfo.name == "Shop") { // 店売りアイテム
                    info.leafType = DMapDataNodeLeafType.Table_Shop;
                }
                else if (mapInfo.name.includes("Shop(Peddler)")) {
                    throw new Error("Not implemented.");
                }
                else if (mapInfo.name.includes("Shop(Weapon)")) {
                    throw new Error("Not implemented.");
                }
                else if (mapInfo.name.includes("Shop(Luxury)")) {
                    throw new Error("Not implemented.");
                }
                else if (mapInfo.name.includes("RandomPot")) {
                    throw new Error("Not implemented.");
                }
                else if (mapInfo.name == "ExitMap") {
                    info.leafType = DMapDataNodeLeafType.System_ExitMap;
                }
            }

            rmmzMapId = mapInfo.parentId;
            count++;
        }
        return info;
    }

    // ここではまずマップ ID の関連付けのみ行う。
    public static linkMapData(mapData: DMap, data: IDataMapInfo, nodeInfo: DMapDataNodeInfo, land: DLand): void {

        if (nodeInfo.leafType !== DMapDataNodeLeafType.RootOrDirctory) {

            // 出現テーブルは当初単一のマップであったが、次のような理由で分けることにした。
            // - Shop 対応を始めたことでテーブルが非常に大きくなり始め、編集が大変になってきた。
            // - 単一の出現テーブルで、ある Entity の出現領域を細かく制御するのが難しい。
            if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Event) {
                land.eventTableMapId = data.id;
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Enemy) {
                land.enemyTableMapId = data.id;
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Item) {
                land.itemTableMapId = data.id;
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Trap) {
                land.trapTableMapId = data.id;
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Shop) {
                land.shopTableMapId = data.id;
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Shop_Peddler) {
                throw new Error("Not implemented.");
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Shop_Weapon) {
                throw new Error("Not implemented.");
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_Shop_Luxury) {
                throw new Error("Not implemented.");
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.Table_RandomPot) {
                throw new Error("Not implemented.");
            }
            else if (nodeInfo.leafType == DMapDataNodeLeafType.System_ExitMap) {
                mapData.exitMap = true;
                land.addEventMap(mapData);
            }
            else if (nodeInfo.directory == DLandMapDataDirectory.Event) {
                mapData.eventMap = true;
                mapData.landId = land.id;
            }
        }
    }

    private static findLand(data: IDataMapInfo | undefined): DLand | undefined {
        if (!data) return undefined;
        return MRData.lands.find(x => data && x.rmmzMapId == data.id);
    }
}

