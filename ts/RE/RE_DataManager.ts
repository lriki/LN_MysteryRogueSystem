import { assert } from "../Common";
import { RE_Data_EntityKind, RE_Data_Actor, RE_Data_Land, RE_Data_Floor, RE_Data, REFloorMapKind } from "./RE_Data";


declare global {  
    interface Window {  
        RE_dataEventTableMap: IDataMap | undefined,
        RE_dataItemTableMap: IDataMap | undefined,
        RE_dataEnemyTableMap: IDataMap | undefined,
        RE_dataTrapTableMap: IDataMap | undefined,
    }  
}  

export class RE_DataManager
{
    static landMapDataLoading: boolean = false;
    static _dataLandDefinitionMap: IDataMap | undefined = undefined;

    static loadData(): void
    {
        RE_Data.addEntityKind("null");
        RE_Data.WeaponKindId = RE_Data.addEntityKind("武器");
        RE_Data.ShieldKindId = RE_Data.addEntityKind("盾");
        RE_Data.ArrowKindId = RE_Data.addEntityKind("矢");
        //RE_Data.addEntityKind("石");
        //RE_Data.addEntityKind("弾");
        RE_Data.BraceletKindId = RE_Data.addEntityKind("腕輪");
        RE_Data.FoodKindId = RE_Data.addEntityKind("食料");
        RE_Data.HerbKindId = RE_Data.addEntityKind("草");
        RE_Data.ScrollKindId = RE_Data.addEntityKind("巻物");
        RE_Data.WandKindId = RE_Data.addEntityKind("杖");
        RE_Data.PotKindId = RE_Data.addEntityKind("壺");
        RE_Data.DiscountTicketKindId = RE_Data.addEntityKind("割引券");
        RE_Data.BuildingMaterialKindId = RE_Data.addEntityKind("材料");
        RE_Data.TrapKindId = RE_Data.addEntityKind("罠");
        RE_Data.FigurineKindId = RE_Data.addEntityKind("土偶");
        RE_Data.MonsterKindId = RE_Data.addEntityKind("モンスター");
        
        // Import Actors
        RE_Data.actors = $dataActors.map((x) => {
            if (x) 
                return {
                    id: x.id ?? 0,
                    name: x.name ?? "",
                };
            else
                return { id: 0, name: "null" };
        });

        // Import Lands
        // 最初に Land を作る
        RE_Data.addLand(0); // dummy
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RELand:")) {
                RE_Data.addLand(i);
            }
        }
        // 次に parent が Land である Map を、データテーブル用のマップとして関連付ける
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info) {
                const land = RE_Data.lands.find(x => info.parentId && x.mapId == info.parentId);
                if (land) {
                    if (info.name?.startsWith("Event")) {
                        land.eventTableMapId = i;
                    }
                    else if (info.name?.startsWith("Item")) {
                        land.itemTableMapId = i;
                    }
                    else if (info.name?.startsWith("Enemy")) {
                        land.enemyTableMapId = i;
                    }
                    else if (info.name?.startsWith("Trap")) {
                        land.trapTableMapId = i;
                    }
                }
            }
        }

        // Floor 情報を作る
        // ※フロア数を Land マップの width としているが、これは MapInfo から読み取ることはできず、
        //   全マップを一度ロードする必要がある。しかしそうすると処理時間が大きくなってしまう。
        //   ひとまず欠番は多くなるが、最大フロア数でデータを作ってみる。
        {
            // 固定マップ
            RE_Data.floors = new Array($dataMapInfos.length + (RE_Data.lands.length * RE_Data.MAX_DUNGEON_FLOORS));
            for (let i = 0; i < $dataMapInfos.length; i++) {
                if (this.isFloorMap(i)) {
                    RE_Data.floors[i] = {
                        id: i,
                        mapKind: REFloorMapKind.FixedMap,
                    };
                }
                else {
                    RE_Data.floors[i] = undefined;
                }
            }

            // ランダムマップ
            for (let i = 0; i < RE_Data.lands.length; i++) {
                const beginFloorId = $dataMapInfos.length + (i * RE_Data.MAX_DUNGEON_FLOORS);
                RE_Data.lands[i].floorIds = new Array(RE_Data.MAX_DUNGEON_FLOORS);
                for (let iFloor = 0; iFloor < RE_Data.MAX_DUNGEON_FLOORS; iFloor++){
                    const floorId = beginFloorId + iFloor;
                    RE_Data.lands[i].floorIds[iFloor] = floorId;
                    RE_Data.floors[floorId] = {
                        id: floorId,
                        mapKind: REFloorMapKind.RandomMap,
                    };
                }
            }
        }

        //console.log("lands:", RE_Data.lands);
    }

    static findLand(mapId: number): RE_Data_Land | undefined {
        const land = RE_Data.lands.find(x => x.mapId == mapId);
        return land;
    }

    static isLandMap(mapId: number) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("RELand:"))
            return true;
        else
            return false;
    }

    static isFloorMap(mapId: number) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("REFloor:"))
            return true;
        else
            return false;
    }

    static dataLandDefinitionMap(): IDataMap | undefined {
        return this._dataLandDefinitionMap;
    }

    static dataEventTableMap(): IDataMap | undefined {
        return window["RE_dataEventTableMap"];
    }

    static dataItemTableMap(): IDataMap | undefined {
        return window["RE_dataItemTableMap"];
    }

    static dataEnemyTableMap(): IDataMap | undefined {
        return window["RE_dataEnemyTableMap"];
    }

    static dataTrapTableMap(): IDataMap | undefined {
        return window["RE_dataTrapTableMap"];
    }
}
