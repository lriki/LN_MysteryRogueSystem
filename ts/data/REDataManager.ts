//import 'types/index.d.ts'
import { RETileAttribute } from "ts/attributes/RETileAttribute";
import { REGame_DecisionBehavior } from "ts/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "ts/behaviors/REUnitBehavior";
import { REGame_UnitAttribute } from "ts/RE/REGame_Attribute";
import { RESystem } from "ts/system/RESystem";
import { assert } from "../Common";
import { RE_Data_EntityKind, RE_Data_Actor, RE_Data_Land, RE_Data_Floor, REData, REFloorMapKind } from "./REData";


declare global {  
    interface Window {
        RE_databaseMap: IDataMap | undefined,
        RE_dataEventTableMap: IDataMap | undefined,
        RE_dataItemTableMap: IDataMap | undefined,
        RE_dataEnemyTableMap: IDataMap | undefined,
        RE_dataTrapTableMap: IDataMap | undefined,
    }
}

export class REDataManager
{
    static databaseMapId: number = 0;
    static landMapDataLoading: boolean = false;
    static _dataLandDefinitionMap: IDataMap | undefined = undefined;

    static setupCommonData() {
        REData.reset();

        // Parameters
        RESystem.parameters = {
            hp: REData.addParameter("HP"),
            atk: REData.addParameter("ATK"),
            def: REData.addParameter("DEF"),
            satiety: REData.addParameter("満腹度"),
        };
        
        RESystem.entityKinds = {
            actor: REData.addEntityKind("Actor", "Actor"),
            WeaponKindId: REData.addEntityKind("武器", "Weapon"),
            ShieldKindId: REData.addEntityKind("盾", "Shield"),
            ArrowKindId: REData.addEntityKind("矢", "Arrow"),
            //RE_Data.addEntityKind("石"),
            //RE_Data.addEntityKind("弾"),
            BraceletKindId: REData.addEntityKind("腕輪", "Bracelet"),
            FoodKindId: REData.addEntityKind("食料", "Food"),
            HerbKindId: REData.addEntityKind("草", "Herb"),
            ScrollKindId: REData.addEntityKind("巻物", "Scroll"),
            WandKindId: REData.addEntityKind("杖", "Wand"),
            PotKindId: REData.addEntityKind("壺", "Pot"),
            DiscountTicketKindId: REData.addEntityKind("割引券", "DiscountTicket"),
            BuildingMaterialKindId: REData.addEntityKind("材料", "BuildingMaterial"),
            TrapKindId: REData.addEntityKind("罠", "Trap"),
            FigurineKindId: REData.addEntityKind("土偶", "Figurine"),
            MonsterKindId: REData.addEntityKind("モンスター", "Monster"),
        };

        // Factions
        {
            REData.factions = [
                { id: 0, name: '', schedulingOrder: 9999 },
                { id: 1, name: 'Friends', schedulingOrder: 1 },
                { id: 2, name: 'Enemy', schedulingOrder: 2 },
                { id: 3, name: 'Neutral', schedulingOrder: 3 },
            ]
        }

        // Actions
        REData.DirectionChangeActionId = REData.addAction("DirectionChange");
        REData.MoveToAdjacentActionId = REData.addAction("MoveToAdjacent");

        // Attributes
        RESystem.attributes = {
            tile: REData.addAttribute("Tile", () => new RETileAttribute()),
            unit: REData.addAttribute("Unit", () => new REGame_UnitAttribute()),
        };

        // Behaviors
        RESystem.behaviors = {
            decision: REData.addBehavior("Decision", () => new REGame_DecisionBehavior()),
            unit: REData.addBehavior("Unit", () => new REUnitBehavior()),
        };
    }

    static loadData(): void
    {
        this.setupCommonData();

        //REData.addAction();
        
        // Import Actors
        $dataActors.forEach(x => {
            if (x) {
                REData.addActor(x.name ?? "");
            }
        });
        // 1番アクターの初期フロアを、RMMZプレイヤーの初期位置にする
        REData.actors[1].initialFloorId = $dataSystem.startMapId ?? 0;
        REData.actors[1].initialX = $dataSystem.startX ?? 0;
        REData.actors[1].initialY = $dataSystem.startY ?? 0;

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
                        mapId: i,
                        mapKind: REFloorMapKind.FixedMap,
                    };
                }
                else if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else {
                    REData.floors[i] = {
                        id: 0,
                        mapId: 0,
                        mapKind: REFloorMapKind.FixedMap,
                    }
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
                        mapId: 0,
                        mapKind: REFloorMapKind.RandomMap,
                    };
                }
            }
        }
    }

    static findLand(mapId: number): RE_Data_Land | undefined {
        const land = REData.lands.find(x => x.mapId == mapId);
        return land;
    }

    static isDatabaseMap(mapId: number) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("REDatabase"))
            return true;
        else
            return false;
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

    static databaseMap(): IDataMap | undefined {
        return window["RE_databaseMap"];
    }
}
