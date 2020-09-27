import { assert } from "../Common";
import { RE_Data_EntityKind, RE_Data_Actor, RE_Data_Land, RE_Data_Floor, REData, REFloorMapKind } from "./REData";


declare global {  
    interface Window {  
        RE_dataEventTableMap: IDataMap | undefined,
        RE_dataItemTableMap: IDataMap | undefined,
        RE_dataEnemyTableMap: IDataMap | undefined,
        RE_dataTrapTableMap: IDataMap | undefined,
    }  
}  

export class REDataManager
{
    static landMapDataLoading: boolean = false;
    static _dataLandDefinitionMap: IDataMap | undefined = undefined;

    static loadData(): void
    {
        REData.addEntityKind("null");
        REData.WeaponKindId = REData.addEntityKind("武器");
        REData.ShieldKindId = REData.addEntityKind("盾");
        REData.ArrowKindId = REData.addEntityKind("矢");
        //RE_Data.addEntityKind("石");
        //RE_Data.addEntityKind("弾");
        REData.BraceletKindId = REData.addEntityKind("腕輪");
        REData.FoodKindId = REData.addEntityKind("食料");
        REData.HerbKindId = REData.addEntityKind("草");
        REData.ScrollKindId = REData.addEntityKind("巻物");
        REData.WandKindId = REData.addEntityKind("杖");
        REData.PotKindId = REData.addEntityKind("壺");
        REData.DiscountTicketKindId = REData.addEntityKind("割引券");
        REData.BuildingMaterialKindId = REData.addEntityKind("材料");
        REData.TrapKindId = REData.addEntityKind("罠");
        REData.FigurineKindId = REData.addEntityKind("土偶");
        REData.MonsterKindId = REData.addEntityKind("モンスター");

        REData.addAction();
        
        // Import Actors
        REData.actors = $dataActors.map((x) => {
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
        REData.addLand(0); // dummy
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RELand:")) {
                REData.addLand(i);
            }
        }
        // 次に parent が Land である Map を、データテーブル用のマップとして関連付ける
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info) {
                const land = REData.lands.find(x => info.parentId && x.mapId == info.parentId);
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
            REData.floors = new Array($dataMapInfos.length + (REData.lands.length * REData.MAX_DUNGEON_FLOORS));
            for (let i = 0; i < $dataMapInfos.length; i++) {
                if (this.isFloorMap(i)) {
                    REData.floors[i] = {
                        id: i,
                        mapKind: REFloorMapKind.FixedMap,
                    };
                }
                else {
                    REData.floors[i] = undefined;
                }
            }

            // ランダムマップ
            for (let i = 0; i < REData.lands.length; i++) {
                const beginFloorId = $dataMapInfos.length + (i * REData.MAX_DUNGEON_FLOORS);
                REData.lands[i].floorIds = new Array(REData.MAX_DUNGEON_FLOORS);
                for (let iFloor = 0; iFloor < REData.MAX_DUNGEON_FLOORS; iFloor++){
                    const floorId = beginFloorId + iFloor;
                    REData.lands[i].floorIds[iFloor] = floorId;
                    REData.floors[floorId] = {
                        id: floorId,
                        mapKind: REFloorMapKind.RandomMap,
                    };
                }
            }
        }

        // Factions
        {
            REData.factions = [
                { id: 0, name: '', schedulingOrder: 0 },
                { id: 1, name: 'Friends', schedulingOrder: 1 },
                { id: 2, name: 'Enemy', schedulingOrder: 2 },
            ]
        }

        //console.log("lands:", RE_Data.lands);
    }

    static findLand(mapId: number): RE_Data_Land | undefined {
        const land = REData.lands.find(x => x.mapId == mapId);
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
