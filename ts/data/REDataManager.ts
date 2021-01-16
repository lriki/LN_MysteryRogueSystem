//import 'types/index.d.ts'
import { RETileAttribute } from "ts/objects/attributes/RETileAttribute";
import { REGame_DecisionBehavior } from "ts/objects/behaviors/REDecisionBehavior";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { LStateBehavior } from "ts/objects/states/LStateBehavior";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { RESystem } from "ts/system/RESystem";
import { assert } from "../Common";
import { DEffect, DEffectHitType, DEffectScope, DEffect_Default, DParameterEffectApplyType } from "./DSkill";
import { RE_Data_Floor, REData, REFloorMapKind } from "./REData";
import { DBasics } from "./DBasics";
import { DState, makeStateTraitsFromMeta } from "./DState";
import { DBehaviorFactory } from "./DBehaviorFactory";
import { DEquipmentType_Default } from "./DEquipmentType";


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

        // Events
        {
            DBasics.events = {
                roomEnterd: 1,
                roomLeaved: 2,
            }
        }

        // Parameters
        RESystem.parameters = {
            hp: REData.addParameter("HP"),
            mp: REData.addParameter("MP"),
            atk: REData.addParameter("ATK"),
            def: REData.addParameter("DEF"),
            mat: REData.addParameter("MAT"),
            mdf: REData.addParameter("MDF"),
            agi: REData.addParameter("AGI"),
            luk: REData.addParameter("LUK"),

            tp: REData.addParameter("TP"),

            satiety: REData.addParameter("満腹度"),
        };
        // RMMZ のパラメータID との一致を検証
        assert(RESystem.parameters.hp === 0);
        assert(RESystem.parameters.mp === 1);
        assert(RESystem.parameters.atk === 2);
        assert(RESystem.parameters.def === 3);
        assert(RESystem.parameters.mat === 4);
        assert(RESystem.parameters.mdf === 5);
        assert(RESystem.parameters.agi === 6);
        assert(RESystem.parameters.luk === 7);
        
        DBasics.entityKinds = {
            actor: REData.addEntityKind("Actor", "Actor"),
            WeaponKindId: REData.addEntityKind("武器", "Weapon"),
            ShieldKindId: REData.addEntityKind("盾", "Shield"),
            ArrowKindId: REData.addEntityKind("矢", "Arrow"),
            //RE_Data.addEntityKind("石"),
            //RE_Data.addEntityKind("弾"),
            BraceletKindId: REData.addEntityKind("腕輪", "Bracelet"),
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
                { id: 0, name: '', schedulingOrder: 9999 },
                { id: 1, name: 'Friends', schedulingOrder: 1 },
                { id: 2, name: 'Enemy', schedulingOrder: 2 },
                { id: 3, name: 'Neutral', schedulingOrder: 3 },
            ]
        }

        // Actions
        DBasics.actions = {
            EquipActionId: REData.addAction("装備"),
            DirectionChangeActionId: REData.addAction("DirectionChange"),
            MoveToAdjacentActionId: REData.addAction("MoveToAdjacent"),
            //moveToAdjacentAsProjectile: REData.addAction("MoveToAdjacent"),
            PickActionId: REData.addAction("Pick"),
            PutActionId: REData.addAction("置く"),//"Put"),
            ExchangeActionId: REData.addAction("交換"),//"Exchange"),
            ThrowActionId: REData.addAction("投げる"),//"Throw"),
            FlungActionId: REData.addAction("Flung"),
            ShootingActionId: REData.addAction("Shooting"),
            CollideActionId: REData.addAction("Collide"),
            AffectActionId: REData.addAction("Affect"),
            RollActionId: REData.addAction("Roll"),
            FallActionId: REData.addAction("Fall"),
            DropActionId: REData.addAction("Drop"),
            StepOnActionId: REData.addAction("StepOn"),
            TrashActionId: REData.addAction("Trash"),
            ProceedFloorActionId: REData.addAction("すすむ"),
            //StairsDownActionId: REData.addAction("StairsDown"),
            //StairsUpActionId: REData.addAction("StairsUp"),
            EquipOffActionId: REData.addAction("EquipOff"),
            EatActionId: REData.addAction("Eat"),
            TakeActionId: REData.addAction("Take"),
            BiteActionId: REData.addAction("Bite"),
            ReadActionId: REData.addAction("Read"),
            SwingActionId: REData.addAction("Swing"),
            PushActionId: REData.addAction("Push"),
            PutInActionId: REData.addAction("PickIn"),
            PickOutActionId: REData.addAction("PickOut"),
            IdentifyActionId: REData.addAction("Identify"),
            //passItem: REData.addAction("PassItem"),
            AttackActionId: REData.addAction("Attack"),
        };
        
        // Attributes
        RESystem.attributes = {
            tile: REData.addAttribute("Tile", () => new RETileAttribute()),
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
            attack: REData.addSequel("attack"),
            CollapseSequel: REData.addSequel("Collapse"),
            asleep: REData.addSequel("asleep"),
        };
        REData.sequels[RESystem.sequels.MoveSequel].parallel = true;
        
        RESystem.skills = {
            normalAttack:1,
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
                        key: x.meta ? x.meta["RE.Key"] : "",
                        displayName: x.name ?? "",
                        restriction: 0,
                        iconIndex: x.iconIndex ?? 0,
                        message1: x.message1 ?? "",
                        message2: x.message2 ?? "",
                        message3: x.message3 ?? "",
                        message4: x.message4 ?? "",
                        traits: x.meta ? makeStateTraitsFromMeta(x.meta) : [],
                    };
                    return state;
                }
                else {
                    return {
                        id: i,
                        displayName: "",
                        key: "",
                        restriction: 0,
                        iconIndex: 0,
                        message1: "",
                        message2: "",
                        message3: "",
                        message4: "",
                        traits: [],
                    }
                }
            });

            // [メモ] 欄で "RE.BasicState:**" が指定されている RMMZ State から探す
            DBasics.states = {
                dead: 1,//REData.addState("Dead", () => new LStateBehavior()),
                nap: $dataStates.findIndex(x => x && x.meta && x.meta["RE.BasicState"] == "Nap"),
                debug_MoveRight: REData.addState("debug_MoveRight", () => new LDebugMoveRightState()),
            };

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
        $dataActors.forEach(x => {
            if (x) {
                const id = REData.addActor(x.name ?? "null");
                const actor = REData.actors[id];
                actor.classId = x.classId ?? 0;
                actor.initialLevel = x.initialLevel ?? 1;
                actor.traits = x.traits ?? [];
            }
        });

        // Import Skills
        $dataSkills.forEach(x => {
            if (x) {
                const id = REData.addSkill(x.name ?? "null");
                const skill = REData.skills[id];
                skill.paramCosts[RESystem.parameters.mp] = x.mpCost ?? 0;
                skill.paramCosts[RESystem.parameters.tp] = x.tpCost ?? 0;
                if ((x.damage.type ?? 0) > 0) {
                    skill.effect = this.makeEffect(x.damage);
                    skill.effect.successRate = x.successRate ?? 100;
                    skill.effect.hitType = x.hitType ?? DEffectHitType.Certain;
                    skill.effect.specialEffects = x.effects ?? [];
                    skill.scope = x.scope ?? DEffectScope.None;
                }
            }
        });

        // Import Item
        REData.itemDataIdOffset = REData.items.length;
        $dataItems.forEach(x => {
            if (x) {
                const id = REData.addItem(x.name ?? "null");
                const item = REData.items[id];
                item.iconIndex = x.iconIndex ?? 0;
                if ((x.damage.type ?? 0) > 0) {
                    item.effect = this.makeEffect(x.damage);
                    item.effect.successRate = x.successRate ?? 100;
                    item.effect.hitType = x.hitType ?? DEffectHitType.Certain;
                    item.effect.specialEffects = x.effects ?? [];
                    item.scope = x.scope ?? DEffectScope.None;
                }
            }
        });
        REData.weaponDataIdOffset = REData.items.length;
        $dataWeapons.forEach(x => {
            if (x) {
                const id = REData.addItem(x.name ?? "null");
                const item = REData.items[id];
                item.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
            }
            else {
                REData.addItem("null");
            }
        });
        REData.armorDataIdOffset = REData.items.length;
        $dataArmors.forEach(x => {
            if (x) {
                const id = REData.addItem(x.name ?? "null");
                const item = REData.items[id];
                item.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
            }
            else {
                REData.addItem("null");
            }
        });
        RESystem.items = {
            autoSupplyFood: 2,
        };
        
        console.log("data",REData.items);

        // Import Monsters
        $dataEnemies.forEach(x => {
            if (x) {
                const id = REData.addMonster(x.name ?? "");
                const monster = REData.monsters[id];
                monster.exp = x.exp ?? 0;
                if (x.params) {
                    // see: Object.defineProperties
                    monster.idealParams[RESystem.parameters.hp] = x.params[0];
                    monster.idealParams[RESystem.parameters.mp] = x.params[1];
                    monster.idealParams[RESystem.parameters.atk] = x.params[2];
                    monster.idealParams[RESystem.parameters.def] = x.params[3];
                    monster.idealParams[RESystem.parameters.mat] = x.params[4];
                    monster.idealParams[RESystem.parameters.mdf] = x.params[5];
                    monster.idealParams[RESystem.parameters.agi] = x.params[6];
                    monster.idealParams[RESystem.parameters.luk] = x.params[7];
                }
            }
        });

        // Import Lands
        // 最初に Land を作る
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RELand:")) {
                REData.addLand({
                    id: -1,
                    rmmzMapId: i,
                    eventTableMapId: 0,
                    itemTableMapId: 0,
                    enemyTableMapId: 0,
                    trapTableMapId: 0,
                    exitEMMZMapId: 0,
                    floorIds: [],
                });
            }
        }



        // parent が Land である Map を、データテーブル用のマップとして関連付ける
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            const parent = (info && info.parentId) ? $dataMapInfos[info.parentId] : undefined;
            const land = (parent) ? REData.lands.find(x => parent.parentId && x.rmmzMapId == parent.parentId) : undefined;

            if (parent && land && parent.name == "[Database]") {
                if (info.name?.startsWith("EventTable")) {
                    land.eventTableMapId = i;
                }
                else if (info.name?.startsWith("ItemTable")) {
                    land.itemTableMapId = i;
                }
                else if (info.name?.startsWith("EnemyTable")) {
                    land.enemyTableMapId = i;
                }
                else if (info.name?.startsWith("TrapTable")) {
                    land.trapTableMapId = i;
                }
                else if (info.name?.includes("RE-ExitMap")) {
                    land.exitEMMZMapId = i;
                }
                else {
                    // 固定マップ or シャッフルマップ用のテンプレートマップ
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
                    const land = REData.lands.find(x => x.rmmzMapId == i);
                    assert(land);
                    REData.floors[i] = { id: i, landId: land.id, mapId: i, mapKind: REFloorMapKind.Land };
                }
                else if (info && info.parentId) {
                    const parentInfo = $dataMapInfos[info.parentId];
                    const land = REData.lands.find(x => parentInfo && parentInfo.parentId && x.rmmzMapId == parentInfo.parentId);
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

        DBehaviorFactory.setup();
    }

    static makeEffect(damage: IDataDamage): DEffect {
        let parameterId = 0;
        let applyType = DParameterEffectApplyType.None;
        switch (damage.type) {
            case 1: // HPダメージ
                parameterId = RESystem.parameters.hp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 2: // MPダメージ
                parameterId = RESystem.parameters.mp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 3: // HP回復
                parameterId = RESystem.parameters.hp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 4: // MP回復
                parameterId = RESystem.parameters.mp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 5: // HP吸収
                parameterId = RESystem.parameters.hp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            case 6: // MP吸収
                parameterId = RESystem.parameters.mp;
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
