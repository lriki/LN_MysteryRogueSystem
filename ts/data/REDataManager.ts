//import 'types/index.d.ts'
import fs from 'fs';
import { REGame_DecisionBehavior } from "ts/objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { RESystem } from "ts/system/RESystem";
import { assert } from "../Common";
import { DEffect, DEffectHitType, DEffectScope, DEffect_Default, DParameterEffectApplyType } from "./DSkill";
import { DMap, REData, REFloorMapKind } from "./REData";
import { DBasics } from "./DBasics";
import { DState, DState_makeDefault, makeStateBehaviorsFromMeta, makeStateTraitsFromMeta } from "./DState";
import { DEquipmentType_Default } from "./DEquipmentType";
import { DAbility, DAbility_Default } from "./DAbility";
import { parseMetaToEntityProperties } from "./DEntityProperties";
import { buildAppearanceTable, buildFloorTable, DLand, DLand_Default } from "./DLand";
import { buildTemplateMapData, DTemplateMap, DTemplateMap_Default } from "./DMap";
import { DHelpers } from "./DHelper";
import { DPrefab, DPrefabDataSource, DSystemPrefabKind } from "./DPrefab";
import { RE_Data_Actor } from './DActor';
import { DItem } from './DItem';


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
    //static landMapDataLoading: boolean = false;
    //static _dataLandDefinitionMap: IDataMap | undefined = undefined;
    
    static loadedLandId: number = 0;
    static loadedFloorMapId: number = 0;
    static loadingMapId: number = 0;

    static setupCommonData() {
        REData.reset();

        // Events
        {
            DBasics.events = {
                roomEnterd: 1,
                roomLeaved: 2,
            }
        }

        // Parameters
        DBasics.params = {
            hp: REData.addParameter("HP"),
            mp: REData.addParameter("MP"),
            atk: REData.addParameter("ATK"),
            def: REData.addParameter("DEF"),
            mat: REData.addParameter("MAT"),
            mdf: REData.addParameter("MDF"),
            agi: REData.addParameter("AGI"),
            luk: REData.addParameter("LUK"),

            tp: REData.addParameter("TP"),

            fp: REData.addParameter("FP"),  // 満腹度
        };
        // RMMZ のパラメータID との一致を検証
        assert(DBasics.params.hp === 0);
        assert(DBasics.params.mp === 1);
        assert(DBasics.params.atk === 2);
        assert(DBasics.params.def === 3);
        assert(DBasics.params.mat === 4);
        assert(DBasics.params.mdf === 5);
        assert(DBasics.params.agi === 6);
        assert(DBasics.params.luk === 7);
        
        DBasics.entityKinds = {
            actor: REData.addEntityKind("Actor", "Actor"),
            WeaponKindId: REData.addEntityKind("武器", "Weapon"),
            ShieldKindId: REData.addEntityKind("盾", "Shield"),
            ArrowKindId: REData.addEntityKind("矢", "Arrow"),
            //RE_Data.addEntityKind("石"),
            //RE_Data.addEntityKind("弾"),
            BraceletKindId: REData.addEntityKind("腕輪", "Ring"),
            FoodKindId: REData.addEntityKind("食料", "Food"),
            grass: REData.addEntityKind("草", "Grass"),
            ScrollKindId: REData.addEntityKind("巻物", "Scroll"),
            WandKindId: REData.addEntityKind("杖", "Wand"),
            PotKindId: REData.addEntityKind("壺", "Pot"),
            DiscountTicketKindId: REData.addEntityKind("割引券", "DiscountTicket"),
            BuildingMaterialKindId: REData.addEntityKind("材料", "BuildingMaterial"),
            TrapKindId: REData.addEntityKind("罠", "Trap"),
            FigurineKindId: REData.addEntityKind("土偶", "Figurine"),
            MonsterKindId: REData.addEntityKind("モンスター", "Monster"),
            exitPoint: REData.addEntityKind("出口", "ExitPoint"),
        };

        DBasics.xparams = { // RMMZ と同じ配列
            hit: 0,
            eva: 1,
            cri: 2,
            cev: 3,
            mev: 4,
            mrf: 5,
            cnt: 6,
            hrg: 7,
            mrg: 8,
            trg: 9,
        };

        DBasics.sparams = { // RMMZ と同じ配列
            tgr: 0,
            grd: 1,
            rec: 2,
            pha: 3,
            mcr: 4,
            tcr: 5,
            pdr: 6,
            mdr: 7,
            fdr: 8,
            exr: 9,
        };

        // StateTraits
        {
            REData.stateTraits = [
                { id: 0, name: "null" },
                { id: 1, name: "RE.StateTrait.Nap" },
            ];

            DBasics.stateTraits = {
                nap: 1,
            };
        }

        // Factions
        {
            REData.factions = [
                { id: 0, name: '', schedulingOrder: 9999, hostileBits: 0, friendBits: 0 },
                { id: 1, name: 'Friends', schedulingOrder: 1, hostileBits: 0b0100, friendBits: 0 },
                { id: 2, name: 'Enemy', schedulingOrder: 2, hostileBits: 0b0010, friendBits: 0 },
                { id: 3, name: 'Neutral', schedulingOrder: 3, hostileBits: 0, friendBits: 0 },
            ];
            DBasics.factions = {
                player: 1,
                enemy: 2,
            };
        }

        // Actions
        DBasics.actions = {
            DirectionChangeActionId: REData.addAction("DirectionChange", "LDirectionChangeActivity"),
            MoveToAdjacentActionId: REData.addAction("MoveToAdjacent", "LMoveAdjacentActivity"),
            //moveToAdjacentAsProjectile: REData.addAction("MoveToAdjacent"),
            PickActionId: REData.addAction("Pick", "LPickActivity"),
            PutActionId: REData.addAction("置く", "LPutActivity"),
            ExchangeActionId: REData.addAction("交換", ""),//"Exchange"),
            ThrowActionId: REData.addAction("投げる", "LThrowActivity"),
            FlungActionId: REData.addAction("Flung", ""),
            ShootingActionId: REData.addAction("Shooting", ""),
            CollideActionId: REData.addAction("Collide", ""),
            AffectActionId: REData.addAction("Affect", ""),
            RollActionId: REData.addAction("Roll", "",),
            FallActionId: REData.addAction("Fall", ""),
            DropActionId: REData.addAction("Drop", ""),
            StepOnActionId: REData.addAction("StepOn", ""),
            TrashActionId: REData.addAction("Trash", ""),
            ForwardFloorActionId: REData.addAction("すすむ", "LForwardFloorActivity"),
            BackwardFloorActionId: REData.addAction("戻る", "LBackwardFloorActivity"),
            //StairsDownActionId: REData.addAction("StairsDown"),
            //StairsUpActionId: REData.addAction("StairsUp"),
            EquipActionId: REData.addAction("装備", "LEquipActivity"),
            EquipOffActionId: REData.addAction("はずす", "LEquipOffActivity"),
            EatActionId: REData.addAction("Eat", ""),
            TakeActionId: REData.addAction("Take", ""),
            BiteActionId: REData.addAction("Bite", ""),
            ReadActionId: REData.addAction("Read", "",),
            WaveActionId: REData.addAction("Wave", "LWaveActivity"),
            PushActionId: REData.addAction("Push", ""),
            PutInActionId: REData.addAction("PickIn",""),
            PickOutActionId: REData.addAction("PickOut", ""),
            IdentifyActionId: REData.addAction("Identify", ""),
            //passItem: REData.addAction("PassItem"),
            AttackActionId: REData.addAction("Attack", ""),
        };
        
        // Attributes
        RESystem.attributes = {
            //tile: REData.addAttribute("Tile", () => new RETileAttribute()),
            unit: REData.addAttribute("Unit", () => new LUnitAttribute()),
        };

        // Behaviors
        RESystem.behaviors = {
            decision: REData.addBehavior("Decision", () => new REGame_DecisionBehavior()),
            unit: REData.addBehavior("Unit", () => new REUnitBehavior()),
            //genericState: REData.addBehavior("GenericState", () => new LGenericState()),
        };

        // Sequels
        RESystem.sequels = {
            idle: REData.addSequel("idle"),
            MoveSequel: REData.addSequel("Move"),
            blowMoveSequel: REData.addSequel("BlowMove"),
            dropSequel: REData.addSequel("BlowMove"),
            attack: REData.addSequel("attack"),
            CollapseSequel: REData.addSequel("Collapse"),
            commonStopped: REData.addSequel("commonStopped"),
            asleep: REData.addSequel("asleep"),
        };
        REData.sequels[RESystem.sequels.MoveSequel].parallel = true;
        
        RESystem.skills = {
            normalAttack:1,
        };

        REData.monsterHouses = [
            { id: 0, name: "null" },
            { id: 1, name: "Fixed" },
            { id: 2, name: "Normal" },
        ];
        DBasics.monsterHouses = {
            fixed: 1,
            normal: 2,
        };
    }

    static loadData(): void
    {
        this.setupCommonData();
        
        REData.system = {
            elements: $dataSystem.elements ?? [],
        };

        if ($dataSystem.equipTypes) {
            REData.equipmentParts = $dataSystem.equipTypes.map((x, i) => {
                if (x) {
                    return {
                        id: i,
                        name: x,
                    };
                }
                else {
                    return DEquipmentType_Default
                }
            });
        }

            /*
        if ($dataSystem.equipTypes && $dataSystem.armorTypes) {
            REData.rmmzWeaponTypeIdOffset = 0;
            const weaponTypes = $dataSystem.equipTypes.map((x, i) => {
                if (x) {
                    return {
                        id: i + REData.rmmzWeaponTypeIdOffset,
                        name: x,
                    };
                }
                else {
                    return DEquipmentType_Default
                }
            });
            REData.rmmzArmorTypeIdOffset = weaponTypes.length;
            const armorTypes = $dataSystem.armorTypes.map((x, i) => {
                if (x) {
                    return {
                        id: i + REData.rmmzArmorTypeIdOffset,
                        name: x,
                    };
                }
                else {
                    return DEquipmentType_Default
                }
            });

            REData.equipTypes = weaponTypes.concat(armorTypes);
        }
            */

        // Import States
        {
            REData.states = $dataStates.map((x, i) => {
                if (x) {
                    let state: DState = {
                        id: i,
                        key: x.meta ? x.meta["RE-Key"] : "",
                        displayName: x.name ?? "",
                        restriction: 0,
                        iconIndex: x.iconIndex ?? 0,
                        message1: x.message1 ?? "",
                        message2: x.message2 ?? "",
                        message3: x.message3 ?? "",
                        message4: x.message4 ?? "",
                        traits: x.meta ? makeStateTraitsFromMeta(x.meta) : [],
                        behaviors: x.meta ? makeStateBehaviorsFromMeta(x.meta) : [],
                    };
                    return state;
                }
                else {
                    return { ...DState_makeDefault(), id: i };
                }
            });

            // [メモ] 欄で "RE.BasicState:**" が指定されている RMMZ State から探す
            DBasics.states = {
                dead: 1,//REData.addState("Dead", () => new LStateBehavior()),
                nap: $dataStates.findIndex(x => x && x.meta && x.meta["RE-BasicState"] == "Nap"),
                debug_MoveRight: $dataStates.findIndex(x => x && x.meta && x.meta["RE-BasicState"] == "DebugMoveRight"),
            };
        }
        
        // Import Abilities
        {
            REData.abilities = $dataStates
                .filter(state => !state || (state.meta && state.meta["RE-Kind"] == "Ability"))
                .map((state, index) => {
                    if (state) {
                        const ability: DAbility = {
                            id: index,
                            key: state.meta["RE-Key"],
                            reactions: [],
                        };
                        Object.keys(state.meta).forEach(key => {
                            if (key.startsWith("RE-Reaction.")) {
                                // TODO: 複数指定の時は ; で分割したい
                                ability.reactions.push({
                                    command: key.substr(12),
                                    script: state.meta[key]});
                            }
                        });
                        return ability;
                    }
                    else {
                        return DAbility_Default();
                    }
                });
        }
        
        // Import Classes
        $dataClasses.forEach(x => {
            if (x) {
                const id = REData.addClass(x.name ?? "null");
                const c = REData.classes[id];
                c.expParams = x.expParams ?? [];
                c.params = x.params ?? [];
                c.traits = x.traits ?? [];
            }
        });

        // Import Actors
        REData.actors = [];
        $dataActors.forEach(x => {
            const actor = new RE_Data_Actor(REData.actors.length);
            REData.actors.push(actor);
            if (x) actor.setup(x);
        });

        // Import Skills
        $dataSkills.forEach(x => {
            if (x) {
                const id = REData.addSkill(x.name ?? "null");
                const skill = REData.skills[id];
                skill.rmmzAnimationId = x.animationId;
                skill.paramCosts[DBasics.params.mp] = x.mpCost;
                skill.paramCosts[DBasics.params.tp] = x.tpCost;
                if ((x.damage.type ?? 0) > 0) {
                    skill.effect = this.makeEffect(x.damage);
                }
                skill.effect.successRate = x.successRate ?? 100;
                skill.effect.hitType = x.hitType ?? DEffectHitType.Certain;
                skill.effect.specialEffects = x.effects ?? [];
                skill.scope = x.scope ?? DEffectScope.None;
            }
        });

        // Import Item
        REData.items = [];
        REData.itemDataIdOffset = REData.items.length;
        $dataItems.forEach(x => {
            const item = new DItem(REData.items.length);
            REData.items.push(item);
            if (x) {
                item.name = x.name;
                item.iconIndex = x.iconIndex ?? 0;
                if ((x.damage.type ?? 0) > 0) {
                    item.effect = this.makeEffect(x.damage);
                }
                item.effect.successRate = x.successRate ?? 100;
                item.effect.hitType = x.hitType ?? DEffectHitType.Certain;
                item.effect.specialEffects = x.effects ?? [];
                item.scope = x.scope ?? DEffectScope.None;
                item.entity = parseMetaToEntityProperties(x.meta);
                item.animationId = x.animationId;
            }
        });
        REData.weaponDataIdOffset = REData.items.length;
        $dataWeapons.forEach(x => {
            const item = new DItem(REData.items.length);
            REData.items.push(item);
            if (x) {
                item.name = x.name;
                item.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
                item.entity = parseMetaToEntityProperties(x.meta);
            }
        });
        REData.armorDataIdOffset = REData.items.length;
        $dataArmors.forEach(x => {
            const item = new DItem(REData.items.length);
            REData.items.push(item);
            if (x) {
                item.name = x.name;
                item.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
                item.entity = parseMetaToEntityProperties(x.meta);
            }
        });
        RESystem.items = {
            autoSupplyFood: 2,
        };
        

        // Import Monsters
        $dataEnemies.forEach(x => {
            if (x) {
                const id = REData.addMonster(x.name ?? "");
                const monster = REData.monsters[id];
                monster.exp = x.exp ?? 0;
                if (x.params) {
                    // see: Object.defineProperties
                    monster.idealParams[DBasics.params.hp] = x.params[0];
                    monster.idealParams[DBasics.params.mp] = x.params[1];
                    monster.idealParams[DBasics.params.atk] = x.params[2];
                    monster.idealParams[DBasics.params.def] = x.params[3];
                    monster.idealParams[DBasics.params.mat] = x.params[4];
                    monster.idealParams[DBasics.params.mdf] = x.params[5];
                    monster.idealParams[DBasics.params.agi] = x.params[6];
                    monster.idealParams[DBasics.params.luk] = x.params[7];
                }
                monster.traits = x.traits ?? [];
                monster.key = (x.meta && x.meta["RE-Key"]) ? x.meta["RE-Key"] : "";
            }
        });

        // Import Lands
        // 最初に Land を作る
        REData.lands = [];
        REData.lands.push(DLand_Default()); // [0] dummy
        REData.lands.push({ ...DLand_Default(), id: 1 }); // [1] REシステム管理外の RMMZ マップを表す Land
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RE-Land:")) {
                REData.lands.push({
                    ...DLand_Default(),
                    id: REData.lands.length,
                    name: info.name,
                    rmmzMapId: i,
                });
            }
        }




        // parent が Land である Map を、データテーブル用のマップとして関連付ける
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info) {
                const parent = (info && info.parentId) ? $dataMapInfos[info.parentId] : undefined;
                
                if (info.name?.includes("RE-ExitMap")) {
                    const land = (parent) ? REData.lands.find(x => info.parentId && x.rmmzMapId == info.parentId) : undefined;
                    if (land) {
                        land.exitRMMZMapId = i;
                    }
                }
                
                if (info.name?.includes("RE-EventTable")) {
                    const land = this.findLand(i)
                    if (land) land.eventTableMapId = i;
                }
                if (info.name?.includes("RE-ItemTable")) {
                    const land = this.findLand(i)
                    if (land) land.itemTableMapId = i;
                }
                if (info.name?.includes("RE-EnemyTable")) {
                    const land = this.findLand(i)
                    if (land) land.enemyTableMapId = i;
                }
                if (info.name?.includes("RE-TrapTable")) {
                    const land = this.findLand(i)
                    if (land) land.trapTableMapId = i;
                }
            }

        }

        // 検証
        for (const land of REData.lands) {
            if (land.id > 0 && land.id != DHelpers.RmmzNormalMapLandId) {
                if (land.exitRMMZMapId == 0) {
                    throw new Error(`Land[${land.name}] is RE-ExitMap not defined.`);
                }
            }
        }

        // Floor 情報を作る
        // ※フロア数を Land マップの width としているが、これは MapInfo から読み取ることはできず、
        //   全マップを一度ロードする必要がある。しかしそうすると処理時間が大きくなってしまう。
        //   ひとまず欠番は多くなるが、最大フロア数でデータを作ってみる。
        {
            // 固定マップ
            REData.maps = new Array($dataMapInfos.length);
            for (let i = 0; i < $dataMapInfos.length; i++) {
                const info = $dataMapInfos[i];
                
                const mapData: DMap = {
                    id: i, landId: DHelpers.RmmzNormalMapLandId, mapId: 0, mapKind: REFloorMapKind.FixedMap, defaultSystem: false,
                };
                REData.maps[i] = mapData;

                if (!info) {
                    // Map 無し。mapId は 0 のまま。
                    continue;
                }
                else {
                    mapData.mapId = i;
                }

                if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else {
                    // 以下、必ず親Mapが必要なもの
                    const parentInfo = $dataMapInfos[info.parentId];
                    if (parentInfo) {
                        if (info.parentId > 0 && parentInfo.name.includes("RE-TemplateMaps")) {
                            mapData.mapKind = REFloorMapKind.TemplateMap;
                            REData.templateMaps.push({
                                ...DTemplateMap_Default(),
                                id: REData.templateMaps.length,
                                name: info.name,
                                mapId: mapData.id,
                            });
                        }
                        else if (info.name?.startsWith("RE-Land:")) {
                            const land = REData.lands.find(x => x.rmmzMapId == i);
                            assert(land);
                            mapData.landId = land.id;
                            mapData.mapKind = REFloorMapKind.Land;
                        }
                        else if (info.parentId) {
                            const land = REData.lands.find(x => parentInfo && parentInfo.parentId && x.rmmzMapId == parentInfo.parentId);
                            if (land) {
                                mapData.landId = land.id;
                                if (parentInfo.name.includes("[RandomMaps]")) {
                                    mapData.mapKind = REFloorMapKind.RandomMap;
                                }
                                else if (parentInfo.name.includes("[ShuffleMaps]")) {
                                    mapData.mapKind = REFloorMapKind.ShuffleMap;
                                }
                                else if (parentInfo.name.includes("RE-FixedMaps")) {
                                    mapData.mapKind = REFloorMapKind.FixedMap;
                                }
                            }
                        }
                    }
                }

                // null 回避のため、REシステム管理外のマップの FloorInfo を作っておく
                if (mapData.landId == DHelpers.RmmzNormalMapLandId) {
                    REData.lands[DHelpers.RmmzNormalMapLandId].floorInfos[mapData.id] = { fixedMapName: "", safetyActions: true };
                }
            }
        }

        // Load Prefabs
        this.beginLoadPrefabs();

        // Load Template Map
        for (const templateMap of REData.templateMaps) {
            this.beginLoadTemplateMap(templateMap);
        }
    }

    private static beginLoadPrefabs(): void {
        assert(this.databaseMapId > 0);
        this.beginLoadMapData(this.databaseMapId, (obj: any) => { 
            const mapData: IDataMap = obj;
            for (const event of mapData.events) {
                if (!event) continue;
                const data = DHelpers.readPrefabMetadata(event);
                if (!data) continue;

                const prefab = new DPrefab();
                prefab.id = REData.prefabs.length;
                prefab.key = event.name;

                REData.prefabs.push(prefab);
                if (data.enemy) {
                    prefab.dataSource = DPrefabDataSource.Enemy;
                    prefab.dataId = REData.monsters.findIndex(x => x.key == data.enemy);
                    if (prefab.dataId <= 0) {
                        throw new Error(`EnemyData not found. (${data.enemy})`);
                    }
                }
                else if (data.item) {
                    prefab.dataSource = DPrefabDataSource.Item;
                    prefab.dataId = REData.getItemFuzzy(data.item).id;
                }
                else if (data.system) {
                    prefab.dataSource = DPrefabDataSource.System;
                    if (data.system == "RE-SystemPrefab:EntryPoint") {
                        prefab.dataId = DSystemPrefabKind.EntryPoint;
                    }
                    else if (data.system == "RE-SystemPrefab:ExitPoint") {
                        prefab.dataId = DSystemPrefabKind.ExitPoint;
                    }
                    else {
                        throw new Error(`Invalid system prefab name. (${data.system})`);
                    }
                }
                else {
                    throw new Error(`Unknown Prefab kind. (Event: ${event.id}.${event.name})`);
                }
            }
            
            // Load Land database
            for (const land of REData.lands) {
                this.beginLoadLandDatabase(land);
            }
        });
    }

    private static beginLoadTemplateMap(templateMap: DTemplateMap): void {
        if (templateMap.mapId > 0) this.beginLoadMapData(templateMap.mapId, (obj: any) => { buildTemplateMapData(obj, templateMap); });
    }

    private static beginLoadLandDatabase(land: DLand): void {
        if (land.rmmzMapId > 0) this.beginLoadMapData(land.rmmzMapId, (obj: any) => { 
            land.floorInfos = buildFloorTable(obj);
            land.appearanceTable = buildAppearanceTable(obj, land.rmmzMapId);
        });
        //if (land.enemyTableMapId > 0) this.beginLoadMapData(land.enemyTableMapId, (obj: any) => { land.appearanceTable = buildAppearanceTable(obj); });
    }
    
    private static beginLoadMapData(rmmzMapId: number, onLoad: (obj: any) => void) {
        const filename = `Map${this.padZero(rmmzMapId, 3)}.json`;
        this.loadDataFile(filename, onLoad);
    }
    private static findLand(rmmzMapId: number): DLand | undefined {
        let mapId = rmmzMapId;
        while (mapId > 0) {
            const land = REData.lands.find(x => x.rmmzMapId == mapId);
            if (land) return land;
            const parentInfo = $dataMapInfos[mapId];
            if (!parentInfo) break;
            mapId = parentInfo.parentId;
        }
        return undefined;
    }

    public static loadPrefabDatabaseMap(): void {
        // Database マップ読み込み開始
        const filename = `Map${this.padZero(REDataManager.databaseMapId, 3)}.json`;
        DataManager.loadDataFile("RE_databaseMap", filename);
    }

    public static padZero(v: number, length: number) {
        return String(v).padStart(length, "0");
    }

    static makeEffect(damage: IDataDamage): DEffect {
        let parameterId = 0;
        let applyType = DParameterEffectApplyType.None;
        switch (damage.type) {
            case 1: // HPダメージ
                parameterId = DBasics.params.hp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 2: // MPダメージ
                parameterId = DBasics.params.mp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 3: // HP回復
                parameterId = DBasics.params.hp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 4: // MP回復
                parameterId = DBasics.params.mp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 5: // HP吸収
                parameterId = DBasics.params.hp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            case 6: // MP吸収
                parameterId = DBasics.params.mp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            default:
                throw new Error();
        }
        return {
            ...DEffect_Default,
            critical: damage.critical ?? false,
            parameterEffects: [{
                parameterId: parameterId,
                elementId: damage.elementId ?? 0,
                formula: damage.formula ?? "0",
                applyType: applyType,
                variance: damage.variance ?? 0,
            }]
        };
    }

    static floor(mapId: number): DMap {
        return REData.maps[mapId];
    }

    static isDatabaseMap(mapId: number) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("RE-Database"))
            return true;
        else
            return false;
    }

    static isLandMap(mapId: number) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("RE-Land:"))
            return true;
        else
            return false;
    }

    static isRESystemMap(mapId: number) : boolean {
        const flooor = REData.maps[mapId];
        return flooor.landId > DHelpers.RmmzNormalMapLandId;
    }

    static isFloorMap(mapId: number) : boolean {
        return REData.maps[mapId].landId > 0;
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

    
    //--------------------------------------------------
    // DataManager の実装
    //   コアスクリプトの DataManager は結果をグローバル変数へ格納するが、
    //   代わりにコールバックで受け取るようにしたもの。
    //   また UnitTest 環境では同期的にロードしたいので、必要に応じて FS を使うようにしている。
    
    private static loadDataFile(src: string, onLoad: (obj: any) => void) {
        if (DHelpers.isNode()) {
            const data = JSON.parse(fs.readFileSync("data/" + src).toString());
            onLoad(data);
        }
        else {
            const xhr = new XMLHttpRequest();
            const url = "data/" + src;
            xhr.open("GET", url);
            xhr.overrideMimeType("application/json");
            xhr.onload = () => this.onXhrLoad(xhr, src, url, onLoad);
            xhr.onerror = () => DataManager.onXhrError(src, src, url);
            xhr.send();
        }
    }

    private static onXhrLoad(xhr: XMLHttpRequest, src: string, url: string, onLoad: (obj: any) => void) {
        if (xhr.status < 400) {
            onLoad(JSON.parse(xhr.responseText));
        } else {
            DataManager.onXhrError(src, src, url);
        }
    }

}
