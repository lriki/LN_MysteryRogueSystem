//import 'types/index.d.ts'
import fs from 'fs';
//import { LDecisionBehavior } from "ts/objects/behaviors/LDecisionBehavior";
//import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { RESystem } from "ts/system/RESystem";
import { assert } from "../Common";
import { DMap, REData, REFloorMapKind } from "./REData";
import { DBasics } from "./DBasics";
import { DAutoRemovalTiming, DState, makeStateBehaviorsFromMeta, makeStateTraitsFromMeta } from "./DState";
import { DEquipmentType_Default } from "./DEquipmentType";
import { DAbility, DAbility_Default } from "./DAbility";
import { parseMetaToEntityProperties } from "./DEntityProperties";
import { DFloorMonsterHouse, DLand } from "./DLand";
import { buildTemplateMapData, DTemplateMap, DTemplateMap_Default } from "./DMap";
import { DHelpers } from "./DHelper";
import { DPrefab, DPrefabDataSource, DSystemPrefabKind } from "./DPrefab";
import { RE_Data_Actor } from './DActor';
import { DItem } from './DItem';
import { DTraits } from './DTraits';
import { DEmittor, DEffectCause, DEffectHitType, DRmmzEffectScope, DParameterEffectApplyType, DParameterQualifying, DEffectFieldScopeRange, DSkillCostSource, DParamCostType } from './DEffect';
import { DSystem } from './DSystem';
import { DSkill } from './DSkill';
import { DEnemy } from './DEnemy';
import { DEntity, DIdentificationDifficulty } from './DEntity';
import { DTroop } from './DTroop';
import { DStateGroup } from './DStateGroup';
import { DIdentifiedTiming } from './DIdentifyer';


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
                preWalk: 3,
                prePut: 4,
                effectReacted: 5,
                skillEmitted: 6,
            }
        }

        // Parameters
        REData.parameters = [
            { id: 0, name: "null", battlerParamId: -1, initialIdealValue: 0 },
            { id: 1, name: "HP", battlerParamId: 0, initialIdealValue: 0 },
            { id: 2, name: "MP", battlerParamId: 1, initialIdealValue: 0 },
            { id: 3, name: "ATK", battlerParamId: 2, initialIdealValue: 0 },
            { id: 4, name: "DEF", battlerParamId: 3, initialIdealValue: 0 },
            { id: 5, name: "MAT", battlerParamId: 4, initialIdealValue: 0 },
            { id: 6, name: "MDF", battlerParamId: 5, initialIdealValue: 0 },
            { id: 7, name: "AGI", battlerParamId: 6, initialIdealValue: 0 },
            { id: 8, name: "LUK", battlerParamId: 7, initialIdealValue: 0 },
            { id: 9, name: "TP", battlerParamId: 8, initialIdealValue: 0 },
            //----------
            { id: 10, name: "FP", battlerParamId: -1, initialIdealValue: 1000 },
            { id: 11, name: "UpgradeValue", battlerParamId: -1, initialIdealValue: 99 },
            { id: 12, name: "Remaining", battlerParamId: -1, initialIdealValue: 99 },
            { id: 13, name: "Capacity", battlerParamId: -1, initialIdealValue: 8 },
        ]
        DBasics.params = {
            hp: REData.parameters.findIndex(x => x.name == "HP"),
            mp: REData.parameters.findIndex(x => x.name == "MP"),
            atk: REData.parameters.findIndex(x => x.name == "ATK"),
            def: REData.parameters.findIndex(x => x.name == "DEF"),
            mat: REData.parameters.findIndex(x => x.name == "MAT"),
            mdf: REData.parameters.findIndex(x => x.name == "MDF"),
            agi: REData.parameters.findIndex(x => x.name == "AGI"),
            luk: REData.parameters.findIndex(x => x.name == "LUK"),
            tp: REData.parameters.findIndex(x => x.name == "TP"),
            fp: REData.parameters.findIndex(x => x.name == "FP"),
            upgradeValue: REData.parameters.findIndex(x => x.name == "UpgradeValue"),
            remaining: REData.parameters.findIndex(x => x.name == "Remaining"),
            capacity: REData.parameters.findIndex(x => x.name == "Capacity"),
        };
        // RMMZ のパラメータID との一致を検証
        assert(REData.parameters[DBasics.params.hp].battlerParamId === 0);
        assert(REData.parameters[DBasics.params.mp].battlerParamId === 1);
        assert(REData.parameters[DBasics.params.atk].battlerParamId === 2);
        assert(REData.parameters[DBasics.params.def].battlerParamId === 3);
        assert(REData.parameters[DBasics.params.mat].battlerParamId === 4);
        assert(REData.parameters[DBasics.params.mdf].battlerParamId === 5);
        assert(REData.parameters[DBasics.params.agi].battlerParamId === 6);
        assert(REData.parameters[DBasics.params.luk].battlerParamId === 7);
        
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
            WandKindId: REData.addEntityKind("杖", "Staff"),
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
            REData.traits = [
                { id: 0, name: "null" },
                { id: 1, name: "RE.StateTrait.Nap" },
            ];

            DBasics.stateTraits = {
                nap: 1,
            };


            REData.traits[DTraits.CertainDirectAttack] = { id: DTraits.CertainDirectAttack, name: "CertainDirectAttack" };
        }

        // Factions
        {
            REData.factions = [
                { id: 0, name: '', schedulingOrder: 9999, hostileBits: 0, friendBits: 0 },
                { id: 1, name: 'Friends', schedulingOrder: 1, hostileBits: 0b0100, friendBits: 0 },
                { id: 2, name: 'Enemy', schedulingOrder: 2, hostileBits: 0b0010, friendBits: 0 },
                { id: 3, name: 'Neutral', schedulingOrder: 3, hostileBits: 0, friendBits: 0 },
            ];
        }

        // Actions
        DBasics.actions = {
            DirectionChangeActionId: REData.addAction("DirectionChange", "LDirectionChangeActivity"),
            MoveToAdjacentActionId: REData.addAction("MoveToAdjacent", "LMoveAdjacentActivity"),
            //moveToAdjacentAsProjectile: REData.addAction("MoveToAdjacent"),
            PickActionId: REData.addAction("Pick", "LPickActivity"),
            PutActionId: REData.addAction("置く", "LPutActivity"),
            ExchangeActionId: REData.addAction("交換", "LExchangeActivity"),//"Exchange"),
            ThrowActionId: REData.addAction("投げる", "LThrowActivity"),
            FlungActionId: REData.addAction("Flung", ""),
            ShootingActionId: REData.addAction("撃つ", "", 1000),
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
            EquipActionId: REData.addAction("装備", "LEquipActivity", 1000),
            EquipOffActionId: REData.addAction("はずす", "LEquipOffActivity"),
            EatActionId: REData.addAction("食べる", "", 1000),
            TakeActionId: REData.addAction("Take", ""),
            BiteActionId: REData.addAction("Bite", ""),
            ReadActionId: REData.addAction("読む", "", 1000),
            WaveActionId: REData.addAction("振る", "LWaveActivity", 1000),
            PushActionId: REData.addAction("Push", ""),
            PutInActionId: REData.addAction("PickIn",""),
            PickOutActionId: REData.addAction("PickOut", ""),
            IdentifyActionId: REData.addAction("Identify", ""),
            //passItem: REData.addAction("PassItem"),
            AttackActionId: REData.addAction("Attack", ""),
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
            escape: REData.addSequel("escape"),
            earthquake2: REData.addSequel("earthquake2"),
        };
        REData.sequels[RESystem.sequels.MoveSequel].parallel = true;
        
        RESystem.skills = {
            move: 3,
            normalAttack: 1,
        };

        REData.monsterHouses = [
            { id: 0, name: "null", bgm: { name: "", pan: 0, pitch: 100, volume: 90 } },
            { id: 1, name: "fixed", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
            { id: 2, name: "normal", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
        ];
        DBasics.monsterHouses = {
            fixed: 1,
            normal: 2,
        };
    }

    static loadData(testMode: boolean): void
    {
        this.setupCommonData();

        REData.system = new DSystem();
        
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
            REData.stateGroups = [new DStateGroup(0)];  // dummy
            for (const x of $dataStates) {
                const state = new DState(REData.states.length);
                REData.states.push(state);
                if (x) {
                    if (x.meta && x.meta["RE-Kind"] == "StateGroup") {
                        const stateGroup = new DStateGroup(REData.stateGroups.length);
                        stateGroup.name = x.name;
                        stateGroup.key = x.meta["RE-Key"];
                        REData.stateGroups.push(stateGroup);
                    }
                    else {
                        state.key = x.meta ? x.meta["RE-Key"]: "";
                        state.displayName = x.name;
                        state.restriction = x.restriction;
                        state.iconIndex = x.iconIndex ?? 0;
                        state.autoRemovalTiming = x.autoRemovalTiming;
                        state.minTurns = x.minTurns;
                        state.maxTurns = x.maxTurns;
                        state.message1 = x.message1 ?? "";
                        state.message2 = x.message2 ?? "";
                        state.message3 = x.message3 ?? "";
                        state.message4 = x.message4 ?? "";
                        state.traits = x.meta ? makeStateTraitsFromMeta(x.meta) : [];
                        state.behaviors = x.meta ? makeStateBehaviorsFromMeta(x.meta) : [];
                        state.import(x);
    
                        if (state.autoRemovalTiming == DAutoRemovalTiming.AfterAction) {
                            // TODO:
                            //console.error("[行動終了時の自動解除] は未実装です。");
                        }
    
                        this.setupDirectly_State(state);
                    }
                }
            }

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
                c.learnings = x.learnings;
            }
        });

        // Import Actors
        REData.actors = [];
        $dataActors.forEach(x => {
            const [entity, actor] = REData.newActor();
            if (x) {
                entity.display.name = x.name;
                entity.entity = parseMetaToEntityProperties(x.meta);
                actor.setup(x);
            }
        });

        // Import Skills
        REData.skills = [];
        $dataSkills.forEach(x => {
            const skill = new DSkill(REData.skills.length);
            REData.skills.push(skill);
            if (x) {
                //const id = REData.addSkill(x.name ?? "null");
                //const skill = REData.skills[id];

                const emittor = REData.newEmittor();
                emittor.effect.critical = false;
                emittor.effect.successRate = x.successRate;
                emittor.effect.hitType = x.hitType;
                emittor.effect.rmmzAnimationId = x.animationId;
                emittor.effect.specialEffectQualifyings = x.effects;

                emittor.costs.setParamCost(DSkillCostSource.Actor, DBasics.params.mp, {type: DParamCostType.Decrease, value: x.mpCost});
                emittor.costs.setParamCost(DSkillCostSource.Actor, DBasics.params.tp, {type: DParamCostType.Decrease, value: x.tpCost});

                if (x.damage.type > 0) {
                    emittor.effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }
                /*
                skill.effectSet.setEffect(DEffectCause.Affect, effect);
                // TODO:
                skill.effectSet.setEffect(DEffectCause.Eat, DEffect_Clone(effect));
                skill.effectSet.setEffect(DEffectCause.Hit, DEffect_Clone(effect));
                */
                skill.emittorId = emittor.id;
                skill.rmmzEffectScope = x.scope ?? DRmmzEffectScope.None;
                skill.parseMetadata(x.meta);

                if (DHelpers.isForFriend(skill.rmmzEffectScope)) {
                //if (DHelpers.isSingle(skill.rmmzEffectScope)) {
                    emittor.scope.range = DEffectFieldScopeRange.Performer;
                }

                this.setupDirectly_Skill(skill);
            }
        });

        // Import Item
        REData.items = [];
        REData.itemDataIdOffset = REData.items.length;
        $dataItems.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;

                const emittor = REData.newEmittor();
                emittor.effect.critical = false;
                emittor.effect.successRate = x.successRate;
                emittor.effect.hitType = x.hitType;
                emittor.effect.rmmzAnimationId = x.animationId;
                emittor.effect.specialEffectQualifyings = x.effects;

                if (x.damage.type > 0) {
                    emittor.effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }
                //effect.rmmzItemEffectQualifying = x.effects.

                entity.effectSet.setEffect(DEffectCause.Affect, emittor);
                // TODO:
                //item.effectSet.setEffect(DEffectCause.Eat, DEffect_Clone(effect));
                //item.effectSet.setEffect(DEffectCause.Hit, DEffect_Clone(effect));
                /*
                if (x.damage.type > 0) {
                    const effect = this.makeEffect(x.damage);
                    effect.successRate = x.successRate;
                    effect.hitType = x.hitType;
                    effect.specialEffects = x.effects;
                    item.effectSet.setEffect(DEffectCause.Eat, DEffect_Clone(effect));
                    item.effectSet.setEffect(DEffectCause.Hit, DEffect_Clone(effect));
                }
                */

                item.rmmzScope = x.scope ?? DRmmzEffectScope.None;
                entity.entity = parseMetaToEntityProperties(x.meta);
                //item.animationId = x.animationId;

                if (DHelpers.isForFriend(item.rmmzScope)) {
                //if (DHelpers.isSingle(item.rmmzScope)) {
                    emittor.scope.range = DEffectFieldScopeRange.Performer;
                }
            }
        });
        REData.weaponDataIdOffset = REData.items.length;
        $dataWeapons.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
                entity.entity = parseMetaToEntityProperties(x.meta);

                // 投げ当て Effect
                const emittor = REData.newEmittor();
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effect.critical = false;
                emittor.effect.successRate = 100;
                emittor.effect.hitType = DEffectHitType.Physical;
                const q: DParameterQualifying = {
                    parameterId: DBasics.params.hp,
                    elementId: 0,
                    formula: "10",
                    applyType: DParameterEffectApplyType.Damage,
                    variance: 20,
                    silent: false,
                };
                emittor.effect.parameterQualifyings.push(q);
                entity.effectSet.setEffect(DEffectCause.Hit, emittor);
            }
        });
        REData.armorDataIdOffset = REData.items.length;
        $dataArmors.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                item.equipmentParts = x.etypeId ? [x.etypeId] : [];
                item.parameters = x.params ?? [];
                item.traits = x.traits ?? [];
                entity.entity = parseMetaToEntityProperties(x.meta);
            }
        });
        RESystem.items = {
            autoSupplyFood: 2,
        };

        for (const item of REData.items) {
            this.setupDirectly_DItem(REData.entities[item]);
        }
        

        // Import Monsters
        $dataEnemies.forEach(x => {
            const [entity, enemy] = REData.newEnemy();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = 71;
                enemy.exp = x.exp;
                if (x.params) {
                    //enemy.idealParams = x.params;
                    
                    entity.idealParams[DBasics.params.hp] = x.params[0];
                    entity.idealParams[DBasics.params.mp] = x.params[1];
                    entity.idealParams[DBasics.params.atk] = x.params[2];
                    entity.idealParams[DBasics.params.def] = x.params[3];
                    entity.idealParams[DBasics.params.mat] = x.params[4];
                    entity.idealParams[DBasics.params.mdf] = x.params[5];
                    entity.idealParams[DBasics.params.agi] = x.params[6];
                    entity.idealParams[DBasics.params.luk] = x.params[7];
                    
                }
                enemy.traits = x.traits;
                enemy.actions = x.actions;
                entity.entity = parseMetaToEntityProperties(x.meta);
            }
        });

        // Import Lands
        // 最初に Land を作る
        REData.lands = [];
        REData.lands.push(new DLand(0)); // [0] dummy
        REData.lands.push(new DLand(1)); // [1] REシステム管理外の RMMZ マップを表す Land
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RE-Land:")) {
                const land = new DLand(REData.lands.length);
                land.name = info.name;
                land.rmmzMapId = i;
                REData.lands.push(land);
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
                    id: i, landId: DHelpers.RmmzNormalMapLandId, mapId: 0, mapKind: REFloorMapKind.FixedMap, exitMap: false, defaultSystem: false,
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
                                
                        if (info.name?.includes("RE-ExitMap")) {
                            mapData.exitMap = true;
                        }
                    }
                }

                // null 回避のため、REシステム管理外のマップの FloorInfo を作っておく
                if (mapData.landId == DHelpers.RmmzNormalMapLandId) {
                    REData.lands[DHelpers.RmmzNormalMapLandId].floorInfos[mapData.id] = {
                        key: "",
                        template: undefined,
                        displayName: undefined,
                        fixedMapName: "", safetyActions: true, bgmName: "", bgmVolume: 90, bgmPitch: 100,
                        monsterHouse: new DFloorMonsterHouse(undefined),
                    };
                }
            }
        }

        // Import Troop
        REData.troops = [];
        for (const x of $dataTroops) {
            const troop = new DTroop(REData.troops.length);
            REData.troops.push(troop);
            if (x) {
                troop.key = x.name;
                troop.members = x.members.map(m => REData.monsters[m.enemyId]);
            }
        }

        // Link
        {
            REData.system.link(testMode);

            for (const state of REData.states) {
                for (const key of state.stateGroupKeys) {
                    const id = REData.stateGroups.findIndex(x => x.key == key);
                    if (id > 0) {
                        state.stateGroupIds.push(id);
                    }
                    else {
                        throw new Error(`StateGroup not found. ${key}`);
                    }
                }
            }

        }

        this.loadDataFile("rogue/Pseudonymous.json", (obj) => REData.pseudonymous.setup(obj));

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

                prefab.image.characterName = event.pages[0].image.characterName;
                prefab.image.direction = event.pages[0].image.direction;
                prefab.image.pattern = event.pages[0].image.pattern;
                prefab.image.characterIndex = event.pages[0].image.characterIndex;
                prefab.image.directionFix = event.pages[0].directionFix;
                prefab.image.stepAnime = event.pages[0].stepAnime;
                prefab.image.walkAnime = event.pages[0].walkAnime;

                REData.prefabs.push(prefab);
                if (data.enemy) {
                    prefab.dataSource = DPrefabDataSource.Enemy;
                    prefab.dataId = REData.getEnemy(data.enemy).id;
                    if (prefab.dataId <= 0) {
                        throw new Error(`EnemyData not found. (${data.enemy})`);
                    }
                }
                else if (data.item) {
                    const item = REData.getItemFuzzy(data.item);
                    prefab.dataSource = DPrefabDataSource.Item;
                    prefab.dataId = item.item().id;
                    item.entity.prefabId = prefab.id;   // 相互リンク
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
                else if (data.kind && data.kind == "ornament") {
                    prefab.dataSource = DPrefabDataSource.Ornament;
                }
                else {
                    //throw new Error(`Unknown Prefab kind. (Event: ${event.id}.${event.name})`);
                }
            }

            // Link Prefab and Entity
            {
                for (const entity of REData.entities) {
                    if (entity.entity.key != "") {
                        if (entity.entity.meta_prefabName) {
                            const prefab = REData.prefabs.find(x => x.key == entity.entity.meta_prefabName);
                            if (prefab) {
                                entity.prefabId = prefab.id;
                            }
                            else {
                                throw new Error(`Unknown Prefab "${entity.entity.meta_prefabName}".`);
                            }
                        }
                        else {
                            throw new Error(`No prefab specified. "${entity.entity.key}"`);
                        }
                    }
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
            land.import(obj);
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

    static makeParameterQualifying(damage: IDataDamage): DParameterQualifying {
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
                parameterId: parameterId,
                elementId: damage.elementId ?? 0,
                formula: damage.formula ?? "0",
                applyType: applyType,
                variance: damage.variance ?? 0,
                silent: false,
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

    static loadingDataFileCount = 0;
    static loadedDataFileCount = 0;
    
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
            this.loadingDataFileCount++;
            const xhr = new XMLHttpRequest();
            const url = "data/" + src;
            xhr.open("GET", url);
            xhr.overrideMimeType("application/json");
            xhr.onload = () => this.onXhrLoad(xhr, src, url, (obj) => { onLoad(obj); this.loadedDataFileCount++; });
            xhr.onerror = () => DataManager.onXhrError(src, src, url);
            xhr.send();
        }
    }

    public static isImportCompleted(): boolean {
        return this.loadingDataFileCount == this.loadedDataFileCount;
    }

    private static onXhrLoad(xhr: XMLHttpRequest, src: string, url: string, onLoad: (obj: any) => void) {
        if (xhr.status < 400) {
            onLoad(JSON.parse(xhr.responseText));
        } else {
            DataManager.onXhrError(src, src, url);
        }
    }

    static setupDirectly_Skill(data: DSkill) {
        const emittor = data.emittor();
        switch (data.key) {
            case "kSkill_炎のブレス_直線":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kSystem_炎のブレス";
                break;
            case "kSkill_魔法弾発射_一般":
                emittor.scope.range = DEffectFieldScopeRange.StraightProjectile;
                emittor.scope.length = Infinity;
                emittor.scope.projectilePrefabKey = "kSystem_MagicBullet";
                data.emittor().costs.setParamCost(DSkillCostSource.Item, DBasics.params.remaining, {type: DParamCostType.Decrease, value: 1});
                break;
            case "kSkill_ふきとばし":
                emittor.effect.otherEffectQualifyings.push({key: "kSystemEffect_ふきとばし"});
                break;
            case "kSkill_変化":
                emittor.effect.otherEffectQualifyings.push({key: "kSystemEffect_変化"});
                break;
            case "kSkill_投げ当て_1ダメ":
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                break;
        }
    }
    
    // NOTE: エディタ側である程度カスタマイズできるように Note の設計を進めていたのだが、
    // どのぐらいの粒度で Behabior を分けるべきなのか現時点では決められなかった。(Activity単位がいいのか、Ability単位か、機能単位か)
    // そのためここで直定義して一通り作ってみた後、再検討する。
    static setupDirectly_DItem(entity: DEntity) {
        const data = entity.item();
        switch (entity.entity.key) {
            case "kゴブリンのこん棒":
                entity.idealParams[DBasics.params.upgradeValue] = 0;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kシルバーソード":
                entity.idealParams[DBasics.params.upgradeValue] = -1;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kレザーシールド":
                entity.idealParams[DBasics.params.upgradeValue] = -1;
                entity.identificationDifficulty = DIdentificationDifficulty.NameGuessed;
                entity.identifiedTiming = DIdentifiedTiming.Equip;
                break;
            case "kウッドアロー":
                entity.display.stackedName = "%1本の" + entity.display.name;
                data.traits.push({code: DTraits.Stackable, dataId: 0, value: 0});
                entity.addReaction(DBasics.actions.ShootingActionId, 0);
                break;
            case "kキュアリーフ":
                const emittor = REData.cloneEmittor(entity.effectSet.mainEmittor());//entity.effectSet.aquireEffect(DEffectCause.Eat);
                emittor.scope.range = DEffectFieldScopeRange.Performer;
                emittor.effect.parameterQualifyings.push({
                    parameterId: DBasics.params.fp,
                    elementId: 0,
                    formula: "5",
                    applyType: DParameterEffectApplyType.Recover,
                    variance: 0,
                    silent: true,
                });
                entity.effectSet.setEffect(DEffectCause.Eat, emittor);
                entity.effectSet.setEffect(DEffectCause.Hit, REData.cloneEmittor(entity.effectSet.mainEmittor()));
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                entity.identifiedTiming = DIdentifiedTiming.Eat;
                entity.canModifierState = false;
                break;
            case "kフレイムリーフ":
                entity.effectSet.setEffect(DEffectCause.Hit, entity.effectSet.mainEmittor());
                //data.effectSet.setSkill(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_隣接"));
                entity.effectSet.setSkill(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線"));
                //data.effectSet.setEffect(DEffectCause.Eat, REData.getSkill("kSkill_炎のブレス_直線").effect());
                break;
            case "kふきとばしの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_ふきとばし").emittor());
                entity.addReaction(DBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[DBasics.params.remaining] = 5;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                break;
            case "kItem_チェンジの杖":
                //data.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").effect);
                entity.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_変化").emittor());
                entity.addReaction(DBasics.actions.WaveActionId, REData.getSkill("kSkill_魔法弾発射_一般").emittor().id);
                entity.idealParams[DBasics.params.remaining] = 3;
                entity.identificationDifficulty = DIdentificationDifficulty.Obscure;
                /*
                    杖のメモ (2021/7/5時点のこうしたい)
                    ----------
                    [振る] はスキルの発動。火炎草が "Eat" でブレススキルを発動するのと同じ。
                    魔法弾はスキル側が生成する。
                    もし炎ブレススキルと合わせるなら、魔法弾スキルを効果の数だけ用意することになる。
                    でも実際はそのほうがいいかもしれない。投げ当てと魔法弾で効果が変わるものもあるため。(トンネルの杖)
                    でもやっぱりほとんどの魔法弾は、投げ当てと同じ効果を発動する。そういった設定も欲しいかも。

                    ある種の、elona の「銃器」みたいな考えの方がいいだろうか？
                    杖と魔法弾、銃と弾丸。
                    弾丸の威力に銃の性能が反映されるように、魔法弾の効果に杖の効果が反映される感じ。
                    投げと魔法弾で異なる効果は、魔法弾に独自の Effect を持たせる。
                    そうでなければ、魔法弾は「自分を射出したEntity(杖) の Cause.Hit の効果を発動する」とか。
                */
                break;
            case "k眠りガス":
                break;
            case "kItem_保存の壺":
                entity.addReaction(DBasics.actions.PutInActionId, 0);
                entity.addReaction(DBasics.actions.PickOutActionId, 0);
                break;
            case "kItem_エスケープスクロール":
                entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_脱出"});
                entity.addReaction(DBasics.actions.ReadActionId, entity.effectSet.mainEmittor().id);
                entity.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
            case "kItem_識別の巻物":
                entity.effectSet.mainEmittor().scope.range = DEffectFieldScopeRange.Selection;
                entity.effectSet.mainEmittor().effect.otherEffectQualifyings.push({key: "kSystemEffect_識別"});
                entity.addReaction(DBasics.actions.ReadActionId, entity.effectSet.mainEmittor().id);
                entity.effectSet.setEffect(DEffectCause.Hit, REData.getSkill("kSkill_投げ当て_1ダメ").emittor());
                break;
                
        }
    }

    static setupDirectly_State(data: DState) {
        switch (data.key) {
            case "kState_UT気配察知":
                data.traits.push({ code: DTraits.UnitVisitor, dataId: 0, value: 0 });
                break;
            case "kState_UnitTest_攻撃必中":
                data.traits.push({ code: DTraits.CertainDirectAttack, dataId: 0, value: 0 });
                break;
            case "kState_UTアイテム擬態":
                data.behaviors.push("LItemImitatorBehavior");
                break;
            case "kState_仮眠2":
                //data.behaviors.push("LDoze2Behavior");
                data.traits.push({ code: DTraits.StateRemoveByEffect, dataId: 0, value: 0 });
                break;
        }
    }
    
    static setupDirectly_StateGroup(data: DStateGroup) {
        switch (data.key) {
            case "kStateGroup_睡眠系":
                data.exclusive = true;
                break;
        }
    }
}
