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
        RE_dataLandMap: IDataMap | undefined,
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
    //static _dataLandDefinitionMap: IDataMap | undefined = undefined;
    
    static loadedLandId: number = 0;
    static loadedFloorMapId: number = 0;
    static loadingMapId: number = 0;

    static setupCommonData() {
        REData.reset();

        // Parameters
        RESystem.parameters = {
            hp: REData.addParameter("HP"),
            mp: REData.addParameter("MP"),
            tp: REData.addParameter("TP"),
            mhp: REData.addParameter("MHP"),
            mmp: REData.addParameter("MMP"),
            atk: REData.addParameter("ATK"),
            def: REData.addParameter("DEF"),
            mat: REData.addParameter("MAT"),
            mdf: REData.addParameter("MDF"),
            agi: REData.addParameter("AGI"),
            luk: REData.addParameter("LUK"),

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
        REData.ProceedFloorActionId = REData.addAction("すすむ");

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

        // Sequels
        RESystem.sequels = {
            MoveSequel: REData.addSequel("Move"),
            CollapseSequel: REData.addSequel("Collapse"),
        };
        REData.sequels[RESystem.sequels.MoveSequel].parallel = true;
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

        // Import Monsters
        $dataEnemies.forEach(x => {
            if (x) {
                const id = REData.addMonster(x.name ?? "");
                const monster = REData.monsters[id];
                monster.exp = x.exp ?? 0;
                if (x.params) {
                    // see: Object.defineProperties
                    monster.params[RESystem.parameters.mhp] = x.params[0];
                    monster.params[RESystem.parameters.mmp] = x.params[1];
                    monster.params[RESystem.parameters.atk] = x.params[2];
                    monster.params[RESystem.parameters.def] = x.params[3];
                    monster.params[RESystem.parameters.mat] = x.params[4];
                    monster.params[RESystem.parameters.mdf] = x.params[5];
                    monster.params[RESystem.parameters.agi] = x.params[6];
                    monster.params[RESystem.parameters.luk] = x.params[7];
                }
            }
        });

        console.log($dataEnemies);
        console.log(REData.monsters);


        // Import Lands
        // 最初に Land を作る
        REData.addLand(0); // dummy
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RELand:")) {
                REData.addLand(i);
            }
        }



        // parent が Land である Map を、データテーブル用のマップとして関連付ける
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
                    else {
                        // 固定マップ or シャッフルマップ用のテンプレートマップ
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
                const info = $dataMapInfos[i];
                if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else if (info && info.name?.startsWith("RELand:")) {
                    const land = REData.lands.find(x => x.mapId == i);
                    assert(land);
                    REData.floors[i] = { id: i, landId: land.id, mapId: i, mapKind: REFloorMapKind.Land };
                }
                else if (info && info.parentId) {
                    const parentInfo = $dataMapInfos[info.parentId];
                    const land = REData.lands.find(x => parentInfo && parentInfo.parentId && x.mapId == parentInfo.parentId);
                    if (land) {
                        let kind = undefined;
                        if (parentInfo.name == "[RandomMaps]") {
                            kind = REFloorMapKind.RandomMap;
                        }
                        else if (parentInfo.name == "[ShuffleMaps]") {
                            kind = REFloorMapKind.ShuffleMap;
                        }
                        else if (parentInfo.name == "[FixedMaps]") {
                            kind = REFloorMapKind.FixedMap;
                        }

                        if (kind !== undefined) {
                            REData.floors[i] = { id: i, landId: land.id, mapId: i, mapKind: kind };
                        }
                        else {
                            // RE には関係のないマップ
                            REData.floors[i] = { id: 0, landId: 0, mapId: 0, mapKind: REFloorMapKind.FixedMap };
                        }
                    }
                    else {
                        // RE には関係のないマップ
                        REData.floors[i] = { id: 0, landId: 0, mapId: 0, mapKind: REFloorMapKind.FixedMap };
                    }
                }
                else {
                    // RE には関係のないマップ
                    REData.floors[i] = { id: 0, landId: 0, mapId: 0, mapKind: REFloorMapKind.FixedMap };
                }

                /*
                const parentInfo = $dataMapInfos[i];

                const land = REData.lands.find(x => info && info.parentId && x.mapId == info.parentId);

                if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else if (land) {
                    // Land の子マップを Floor として採用
                    REData.floors[i] = {
                        id: i,
                        landId: land.id,
                        mapId: i,
                        mapKind: REFloorMapKind.FixedMap,
                    };
                }
                */
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
                        landId: REData.lands[i].id,
                        mapId: 0,
                        mapKind: REFloorMapKind.RandomMap,
                    };
                }
            }
        }
    }

    static floor(mapId: number): RE_Data_Floor {
        return REData.floors[mapId];
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

    static isRESystemMap(mapId: number) : boolean {
        const flooor = REData.floors[mapId];
        return flooor.landId > 0;
    }

    static isFloorMap(mapId: number) : boolean {
        return REData.floors[mapId].landId > 0;
        /*
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("REFloor:"))
            return true;
        else
            return false;
        */
    }

    static dataLandDefinitionMap(): IDataMap | undefined {
        return window["RE_dataLandMap"];
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
