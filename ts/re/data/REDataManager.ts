import fs from 'fs';
import { RESystem } from "ts/re/system/RESystem";
import { assert, RESerializable, tr2 } from "../Common";
import { DMap, REData, REFloorMapKind } from "./REData";
import { REBasics } from "./REBasics";
import { DState, DStateRestriction, makeStateBehaviorsFromMeta } from "./DState";
import { DEquipmentType_Default } from "./DEquipmentType";
import { DAbility, DAbility_Default } from "./DAbility";
import { parseMetaToEntityProperties } from "./DEntityProperties";
import { DFloorMonsterHouse, DLand, DLandIdentificationLevel, DMapId, DTerrainSettingRef } from "./DLand";
import { buildTemplateMapData, DTemplateMap, DTemplateMap_Default } from "./DMap";
import { DHelpers } from "./DHelper";
import { DPrefab, DPrefabMoveType, DSystemPrefabKind } from "./DPrefab";
import { RE_Data_Actor } from './DActor';
import { DEquipment } from './DItem';
import { DTrait } from './DTraits';
import { DEffectHitType, DRmmzEffectScope, DParameterEffectApplyType, DParameterQualifying, DEffectFieldScopeRange, DSkillCostSource, DParamCostType, DEffect, DParameterApplyTarget } from './DEffect';
import { DSystem } from './DSystem';
import { DSkill } from './DSkill';
import { DTroop } from './DTroop';
import { DStateGroup } from './DStateGroup';
import { RESetup } from './RESetup';
import { DAttackElement } from './DAttackElement';
import { DParamMessageValueSource, REData_Parameter } from './DParameter';
import { DDataImporter } from './DDataImporter';
import { DDropItem } from './DEnemy';
import { DTextManager } from './DTextManager';
import { DAnnotationReader } from './DAnnotationReader';
import { DMetadataParser } from './DMetadataParser';
import { DSetupScript } from './DSetupScript';
import { DSectorConnectionPreset, FGenericRandomMapWayConnectionMode } from './DTerrainPreset';
import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from '../PluginParameters';


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
            REBasics.events = {
                roomEnterd: 1,
                roomLeaved: 2,
                preWalk: 3,
                walked: 4,
                prePut: 5,
                effectReacted: 6,
                skillEmitted: 7,
            }
        }

        // Parameters
        REData.parameters = [
            REData_Parameter.makeBuiltin(0, "null", "null", "null", -1, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(1, "hp", "HP", tr2("最大HP"), 0, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(2, "mp", "MP", tr2("最大MP"), 1, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(3, "atk", "ATK", tr2("最大ATK"), 2, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(4, "def", "DEF", tr2("最大DEF"), 3, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(5, "mat", "MAT", tr2("最大MAT"), 4, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(6, "mdf", "MDF", tr2("最大MDF"), 5, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(7, "agi", "AGI", tr2("最大AGI"), 6, 0, -100, 200),
            REData_Parameter.makeBuiltin(8, "luk", "LUK", tr2("最大LUK"), 7, 0, 0, Infinity),
            REData_Parameter.makeBuiltin(9, "tp", "TP", tr2("最大TP"), 8, 0, 0, Infinity),
            //----------
            REData_Parameter.makeBuiltin(10, "fp", tr2("満腹度"), tr2("最大満腹度"), -1, 10000, 0, Infinity),    // FP
            REData_Parameter.makeBuiltin(11, "pow", tr2("ちから"), tr2("ちからの最大値"), -1, 8, 0, Infinity),   // Power
            REData_Parameter.makeBuiltin(12, "up", tr2("つよさ"), tr2("つよさの最大値"), -1, 99, -Infinity, Infinity),
            REData_Parameter.makeBuiltin(13, "rem", tr2("回数"), tr2("最大回数"), -1, 99, 0, Infinity),
            REData_Parameter.makeBuiltin(14, "cap", "Capacity", tr2("最大容量"), -1, 8, 0, Infinity),
            REData_Parameter.makeBuiltin(15, "gold", "Gold", tr2("最大ゴールド"), -1, 999999, 10, Infinity),
            REData_Parameter.makeBuiltin(16, "level", tr2("レベル"), tr2("最大レベル"), -1, 99, 1, Infinity),
            REData_Parameter.makeBuiltin(17, "exp", tr2("経験値"), tr2("最大経験値"), -1, 999999, 0, Infinity),
        ];
        REBasics.params = {
            hp: REData.parameters.findIndex(x => x.code == "hp"),
            mp: REData.parameters.findIndex(x => x.code == "mp"),
            atk: REData.parameters.findIndex(x => x.code == "atk"),
            def: REData.parameters.findIndex(x => x.code == "def"),
            mat: REData.parameters.findIndex(x => x.code == "mat"),
            mdf: REData.parameters.findIndex(x => x.code == "mdf"),
            agi: REData.parameters.findIndex(x => x.code == "agi"),
            luk: REData.parameters.findIndex(x => x.code == "luk"),
            tp: REData.parameters.findIndex(x => x.code == "tp"),
            fp: REData.parameters.findIndex(x => x.code == "fp"),
            pow: REData.parameters.findIndex(x => x.code == "pow"),
            upgradeValue: REData.parameters.findIndex(x => x.code == "up"),
            remaining: REData.parameters.findIndex(x => x.code == "rem"),
            capacity: REData.parameters.findIndex(x => x.code == "cap"),
            gold: REData.parameters.findIndex(x => x.code == "gold"),
            level: REData.parameters.findIndex(x => x.code == "level"),
            exp: REData.parameters.findIndex(x => x.code == "exp"),
        };
        // RMMZ のパラメータID との一致を検証
        assert(REData.parameters[REBasics.params.hp].battlerParamId === 0);
        assert(REData.parameters[REBasics.params.mp].battlerParamId === 1);
        assert(REData.parameters[REBasics.params.atk].battlerParamId === 2);
        assert(REData.parameters[REBasics.params.def].battlerParamId === 3);
        assert(REData.parameters[REBasics.params.mat].battlerParamId === 4);
        assert(REData.parameters[REBasics.params.mdf].battlerParamId === 5);
        assert(REData.parameters[REBasics.params.agi].battlerParamId === 6);
        assert(REData.parameters[REBasics.params.luk].battlerParamId === 7);

        REData.parameters[REBasics.params.pow].selfGainMessage = DTextManager.actorGain;
        REData.parameters[REBasics.params.pow].selfLossMessage = DTextManager.actorLoss;
        REData.parameters[REBasics.params.pow].targetGainMessage = DTextManager.actorGain;
        REData.parameters[REBasics.params.pow].targetLossMessage = DTextManager.enemyLoss;
        REData.parameters[REBasics.params.upgradeValue].selfGainMessage = DTextManager.actorGain;
        REData.parameters[REBasics.params.upgradeValue].selfLossMessage = DTextManager.actorLoss;
        REData.parameters[REBasics.params.upgradeValue].targetGainMessage = DTextManager.actorGain;
        REData.parameters[REBasics.params.upgradeValue].targetLossMessage = DTextManager.enemyLoss;
        REData.parameters[REBasics.params.level].initialValue = 1;
        REData.parameters[REBasics.params.exp].initialValue = 0;
        REData.parameters[REBasics.params.level].selfGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].selfLossMessage = DTextManager.actorLoss;
        REData.parameters[REBasics.params.level].targetGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].targetLossMessage = DTextManager.enemyLoss;
        REData.parameters[REBasics.params.level].messageValueSource = DParamMessageValueSource.Absolute;
        
        
        REBasics.entityKinds = {
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
            entryPoint: REData.addEntityKind("入り口", "EntryPoint"),
            exitPoint: REData.addEntityKind("出口", "ExitPoint"),
            Ornament: REData.addEntityKind("Ornament", "Ornament"),
        };

        REBasics.xparams = { // RMMZ と同じ配列
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

        REBasics.sparams = { // RMMZ と同じ配列
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
            REData.traits = [];
            REBasics.traits = {} as any;
            REData.traits[11] = new DTrait(11, "TRAIT_ELEMENT_RATE");
            REBasics.traits.TRAIT_ELEMENT_RATE = 11;
            REData.traits[12] = new DTrait(12, "TRAIT_DEBUFF_RATE");
            REBasics.traits.TRAIT_DEBUFF_RATE = 12;
            REData.traits[13] = new DTrait(13, "TRAIT_STATE_RATE");
            REBasics.traits.TRAIT_STATE_RATE = 13;
            REData.traits[14] = new DTrait(14, "TRAIT_STATE_RESIST");
            REBasics.traits.TRAIT_STATE_RESIST = 14;
            REData.traits[21] = new DTrait(21, "TRAIT_PARAM");
            REBasics.traits.TRAIT_PARAM = 21;
            REData.traits[22] = new DTrait(22, "TRAIT_XPARAM");
            REBasics.traits.TRAIT_XPARAM = 22;
            REData.traits[23] = new DTrait(23, "TRAIT_SPARAM");
            REBasics.traits.TRAIT_SPARAM = 23;
            REData.traits[31] = new DTrait(31, "TRAIT_ATTACK_ELEMENT");
            REBasics.traits.TRAIT_ATTACK_ELEMENT = 31;
            REData.traits[32] = new DTrait(32, "TRAIT_ATTACK_STATE");
            REBasics.traits.TRAIT_ATTACK_STATE = 32;
            REData.traits[33] = new DTrait(33, "TRAIT_ATTACK_SPEED");
            REBasics.traits.TRAIT_ATTACK_SPEED = 33;
            REData.traits[34] = new DTrait(34, "TRAIT_ATTACK_TIMES");
            REBasics.traits.TRAIT_ATTACK_TIMES = 34;
            REData.traits[35] = new DTrait(35, "TRAIT_ATTACK_SKILL");
            REBasics.traits.TRAIT_ATTACK_SKILL = 35;
            REData.traits[41] = new DTrait(41, "TRAIT_STYPE_ADD");
            REBasics.traits.TRAIT_STYPE_ADD = 41;
            REData.traits[42] = new DTrait(42, "TRAIT_STYPE_SEAL");
            REBasics.traits.TRAIT_STYPE_SEAL = 42;
            REData.traits[43] = new DTrait(43, "TRAIT_SKILL_ADD");
            REBasics.traits.TRAIT_SKILL_ADD = 43;
            REData.traits[44] = new DTrait(44, "TRAIT_SKILL_SEAL");
            REBasics.traits.TRAIT_SKILL_SEAL = 44;
            REData.traits[51] = new DTrait(51, "TRAIT_EQUIP_WTYPE");
            REBasics.traits.TRAIT_EQUIP_WTYPE = 51;
            REData.traits[52] = new DTrait(52, "TRAIT_EQUIP_ATYPE");
            REBasics.traits.TRAIT_EQUIP_ATYPE = 52;
            REData.traits[53] = new DTrait(53, "TRAIT_EQUIP_LOCK");
            REBasics.traits.TRAIT_EQUIP_LOCK = 53;
            REData.traits[54] = new DTrait(54, "TRAIT_EQUIP_SEAL");
            REBasics.traits.TRAIT_EQUIP_SEAL = 54;
            REData.traits[55] = new DTrait(55, "TRAIT_SLOT_TYPE");
            REBasics.traits.TRAIT_SLOT_TYPE = 55;
            REData.traits[61] = new DTrait(61, "TRAIT_ACTION_PLUS");
            REBasics.traits.TRAIT_ACTION_PLUS = 61;
            REData.traits[62] = new DTrait(62, "TRAIT_SPECIAL_FLAG");
            REBasics.traits.TRAIT_SPECIAL_FLAG = 62;
            REData.traits[63] = new DTrait(63, "TRAIT_COLLAPSE_TYPE");
            REBasics.traits.TRAIT_COLLAPSE_TYPE = 63;
            REData.traits[64] = new DTrait(64, "TRAIT_PARTY_ABILITY");
            REBasics.traits.TRAIT_PARTY_ABILITY = 64;

            REBasics.traits._separator = REData.newTrait("_separator").id;
            REBasics.traits.CertainDirectAttack = REData.newTrait("CertainDirectAttack").id;
            REBasics.traits.DodgePhysicalIndirectAttack = REData.newTrait("CartailDodgePhysicalAttack").id;
            REBasics.traits.AwfulPhysicalIndirectAttack = REData.newTrait("AwfulPhysicalIndirectAttack").id;
            REBasics.traits.UnitVisitor = REData.newTrait("UnitVisitor").id;
            REBasics.traits.StateRemoveByEffect = REData.newTrait("StateRemoveByEffect").id;
            REBasics.traits.Stackable = REData.newTrait("Stackable").id;
            REBasics.traits.EffectProficiency = REData.newTrait("EffectProficiency").id;
            REBasics.traits.EquipmentProficiency = REData.newTrait("EquipmentProficiency").id;
            REBasics.traits.SealActivity = REData.newTrait("SealActivity").id;
            REBasics.traits.SealSpecialAbility = REData.newTrait("SealSpecialAbility").id;
            REBasics.traits.Invisible = REData.newTrait("Invisible").id;
            REBasics.traits.ForceVisible = REData.newTrait("ForceVisible").id;
            REBasics.traits.ItemDropRate = REData.newTrait("ItemDropRate").id;
            REBasics.traits.FixedDamage = REData.newTrait("FixedDamage").id;
            REBasics.traits.DrawInTrap = REData.newTrait("DrawInTrap").id;
            REBasics.traits.AwakeStep = REData.newTrait("AwakeStep").id;
            REBasics.traits.SilentStep = REData.newTrait("SilentStep").id;
            REBasics.traits.SuddenSkillEffect = REData.newTrait("AutoSkillEffect").id;
            REBasics.traits.SurvivalParamLossRate = REData.newTrait("SurvivalParamLossRate").id;
            REBasics.traits.ParamDamageRate = REData.newTrait("ParamDamageRate").id;
            REBasics.traits.SkillGuard = REData.newTrait("SkillGuard").id;
            REBasics.traits.DisableTrap = REData.newTrait("DisableTrap").id;
            //REBasics.traits.RecoverRate = REData.newTrait("RecoverRate").id;
            //REBasics.traits.ElementedRecoverRate = REData.newTrait("ElementedRecoverRate").id;
            REBasics.traits.ElementedRecoveryRate = REData.newTrait("ElementedRecoverRate").id;
            REBasics.traits.RaceRate = REData.newTrait("RaceRate").id;
            REBasics.traits.PhysicalProjectileReflector = REData.newTrait("PhysicalProjectileReflector").id;
            REBasics.traits.PenetrationItem = REData.newTrait("PenetrationItem").id;
            REBasics.traits.PenetrationThrower = REData.newTrait("PenetrationThrower").id;
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
        REBasics.actions = {
            DirectionChangeActionId: REData.addAction("DirectionChange", "LDirectionChangeActivity"),
            MoveToAdjacentActionId: REData.addAction("MoveToAdjacent", "LMoveAdjacentActivity"),
            //moveToAdjacentAsProjectile: REData.addAction("MoveToAdjacent"),
            PickActionId: REData.addAction("Pick", "LPickActivity"),
            PutActionId: REData.addAction("置く", "LPutActivity"),
            ExchangeActionId: REData.addAction("交換", "LExchangeActivity"),//"Exchange"),
            ThrowActionId: REData.addAction("投げる", "LThrowActivity"),
            FlungActionId: REData.addAction("Flung", ""),
            ShootingActionId: REData.addAction("撃つ", "", 1000),
            //CollideActionId: REData.addAction("Collide", ""),
            AffectActionId: REData.addAction("Affect", ""),
            RollActionId: REData.addAction("Roll", "",),
            FallActionId: REData.addAction("Fall", ""),
            DropActionId: REData.addAction("Drop", ""),
            trample: REData.addAction("trample", ""),
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
            talk: REData.addAction("talk", ""),
            collide: REData.addAction("collide", ""),
            dialogResult: REData.addAction("dialogResult", ""),
            stumble: REData.addAction("stumble", ""),
            dead: REData.addAction("dead", ""),
            //passItem: REData.addAction("PassItem"),
            performSkill: REData.addAction("PerformSkill", ""),
            AttackActionId: REData.addAction("Attack", ""),
        };
        

        // Sequels
        REBasics.sequels = {
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
            useItem: REData.addSequel("useItem"),
            explosion: REData.addSequel("explosion"),
            down: REData.addSequel("down"),
            warp: REData.addSequel("warp"),
            stumble: REData.addSequel("stumble"),
            jump: REData.addSequel("stumble"),
        };
        REData.sequels[REBasics.sequels.MoveSequel].parallel = true;
        REData.sequels[REBasics.sequels.MoveSequel].fluidSequence = true;
        REData.sequels[REBasics.sequels.CollapseSequel].parallel = true;
        REData.sequels[REBasics.sequels.stumble].parallel = true;
        REData.sequels[REBasics.sequels.dropSequel].parallel = true;    // 転倒とアイテムドロップを並列実行したい
        REData.sequels[REBasics.sequels.jump].parallel = true;
        
        RESystem.skills = {
            move: 3,
            normalAttack: 1,
        };

        REData.monsterHouses = [
            { id: 0, name: "null", bgm: { name: "", pan: 0, pitch: 100, volume: 90 } },
            { id: 1, name: "fixed", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
            { id: 2, name: "normal", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
        ];
        REBasics.monsterHouses = {
            fixed: 1,
            normal: 2,
        };

        REData.itemShops = [
            { id: 0, name: "null", bgm: { name: "", pan: 0, pitch: 100, volume: 90 } },
            { id: 1, name: "fixed", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
            { id: 2, name: "normal", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
        ];
        REBasics.itemShops = {
            fixed: 1,
            normal: 2,
        };

        REBasics.effectBehaviors = {
            itemSteal: REData.newEffectBehavior("ItemSteal").id,
            goldSteal: REData.newEffectBehavior("GoldSteal").id,
            levelDown: REData.newEffectBehavior("LevelDown").id,
            warp: REData.newEffectBehavior("Warp").id,
            stumble: REData.newEffectBehavior("Stumble").id,
            transferToNextFloor: REData.newEffectBehavior("TransferToNextFloor").id,
            transferToLowerFloor: REData.newEffectBehavior("TransferToLowerFloor").id,
            trapProliferation: REData.newEffectBehavior("TrapProliferation").id,
            dispelEquipments: REData.newEffectBehavior("DispelEquipments").id,
            changeInstance: REData.newEffectBehavior("ChangeInstance").id,
            restartFloor: REData.newEffectBehavior("RestartFloor").id,
            clarification: REData.newEffectBehavior("Clarification").id,
            division: REData.newEffectBehavior("Division").id,
            removeStatesByIntentions: REData.newEffectBehavior("RemoveStatesByIntentions").id,
            performeSkill: REData.newEffectBehavior("PerformeSkill").id,
        };

        {
            {
                const shape = REData.newTerrainShape("kTerrainShape_Default");
                shape.wayConnectionMode = FGenericRandomMapWayConnectionMode.SectionEdge;
            }
            {
                const shape = REData.newTerrainShape("kTerrainShape_SimpleDefault");
                shape.wayConnectionMode = FGenericRandomMapWayConnectionMode.RoomEdge;
            }
            {
                const shape = REData.newTerrainShape("kTerrainShape_Small2x2");
                shape.width = Math.floor(paramRandomMapDefaultWidth * (2 / 3));
                shape.height = Math.floor(paramRandomMapDefaultHeight * (2 / 3));
                shape.divisionCountX = 2;
                shape.divisionCountY = 2;
                shape.roomCountMin = 3;
                shape.roomCountMax = 4;
            }
            {
                const shape = REData.newTerrainShape("kTerrainShape_GreatHall");
                shape.divisionCountX = 1;
                shape.divisionCountY = 1;
                shape.forceRoomShapes = [{typeName: "FullPlane"}];
            }
            {
                const shape = REData.newTerrainShape("kTerrainShape_HalfHall");
                shape.divisionCountX = 1;
                shape.divisionCountY = 1;
                shape.forceRoomShapes = [{typeName: "HalfPlane"}];
            }
            {
                const shape = REData.newTerrainShape("kTerrainShape_C");
                shape.divisionCountX = 3;
                shape.divisionCountY = 3;
                shape.connectionPreset = DSectorConnectionPreset.C;
            }

            //----------

            {
                const setting = REData.newTerrainSetting("kTerrainSetting_Default");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_Default").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_SimpleDefault");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_SimpleDefault").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_Small2x2");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_Small2x2").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_GreatHall");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_GreatHall").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_HalfHall");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_HalfHall").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_C");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_C").id, rate: 1});
            }
            {
                const setting = REData.newTerrainSetting("kTerrainSetting_GreatHallMH");
                setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_GreatHall").id, rate: 1});
                setting.forceStructures = [{typeName: "MonsterHouse", rate: 100}];
            }

            //----------

            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Default");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Default").id, 1));
                REBasics.defaultTerrainPresetId = preset.id;
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_GreatHall");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_GreatHall").id, 1)); 
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_GreatHallMH");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_GreatHallMH").id, 1)); 
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level1");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Small2x2").id, 1)); 
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level2");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_SimpleDefault").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_C").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level3_First");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_SimpleDefault").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level3");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Default").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_C").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level4_First");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_SimpleDefault").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level4");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Default").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_C").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_GreatHall").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_HalfHall").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level5_First");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_SimpleDefault").id, 1));
            }
            {
                const preset = REData.newTerrainPreset("kTerrainPreset_Level5");
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_Default").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_C").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_GreatHall").id, 1));
                preset.presets.push(new DTerrainSettingRef(REData.getTerrainSetting("kTerrainSetting_HalfHall").id, 1));
            }
        }

        
        // REBasics.presets = {
        //     trap: REData.newPreset("Trap").id,
        // }
    }

    static loadData(testMode: boolean): void
    {
        this.setupCommonData();

        REData.system = new DSystem();

        // Import AttackElements
        REData.attackElements = [];
        for (const x of $dataSystem.elements) {
            const e = new DAttackElement(REData.attackElements.length);
            REData.attackElements.push(e);
            if (x) {
                e.parseNameAndKey(x);
            }
        }

        REBasics.variables = {
            result: $dataSystem.variables.findIndex(x => x == "MR-CommndResult1"),
            landExitResult: $dataSystem.variables.findIndex(x => x == "MR-ExitResult"),
            landExitResultDetail: $dataSystem.variables.findIndex(x => x == "MR-ExitResultDetail"),
        };

        REBasics.elements = {
            explosion: REData.getAttackElement("kElement_Explosion").id,
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


        // Import States
        {
            REData.stateGroups = [new DStateGroup(0)];  // dummy
            for (const x of $dataStates) {
                const state = new DState(REData.states.length);
                REData.states.push(state);
                if (x) {
                    const meta = DMetadataParser.parse(x.meta);

                    if (meta.type == "StateGroup") {
                        const stateGroup = new DStateGroup(REData.stateGroups.length);
                        stateGroup.name = x.name;
                        stateGroup.key = meta.key;
                        REData.stateGroups.push(stateGroup);
                        RESetup.setupDirectly_StateGroup(stateGroup);
                    }
                    else {
                        state.key = meta.key;
                        state.displayName = x.name;
                        state.effect.restriction = DStateRestriction.fromRmmzRestriction(x.restriction);
                        state.iconIndex = x.iconIndex ?? 0;
                        state.priority = x.priority;
                        state.message1 = x.message1 ?? "";
                        state.message2 = x.message2 ?? "";
                        state.message3 = x.message3 ?? "";
                        state.message4 = x.message4 ?? "";
                        state.effect.behaviors = meta.behaviors;
                        state.effect.traits = x.traits.concat(meta.traits);
                        //state.effect.traits = x.traits.concat(DTrait.parseTraitMetadata(x.meta));
                        //state.effect.behaviors = makeStateBehaviorsFromMeta(x.meta);
                        state.import(x);
                    }
                }
            }
            for (const state of REData.states) {
                RESetup.setupDirectly_State(state);
            }

            REBasics.states = {
                dead: 1,
                nap: REData.getState("kState_System_kNap").id,
                trapPerformed: REData.getState("kState_System_TrapPerformed").id,
            };
        }
        
        // Import Abilities
        {
            REData.abilities = $dataStates
                .filter(state => !state || (state.meta && state.meta["MR-Type"] == "Ability"))
                .map((state, index) => {
                    if (state) {
                        const ability: DAbility = {
                            id: index,
                            key: state.meta["MR-Key"].trim(),
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
                const meta = DMetadataParser.parse(x.meta);
                if (meta.type == "Race") {
                    const race = REData.newRace();
                    race.key = meta.key;
                    race.name = x.name;
                    race.traits = x.traits ?? [];
                }
                else {
                    const id = REData.addClass(x.name ?? "null");
                    const c = REData.classes[id];
                    c.expParams = x.expParams ?? [];
                    c.params = x.params ?? [];
                    c.traits = x.traits ?? [];
                    c.learnings = x.learnings;
                }
            }
        });
        REBasics.defaultEnemyClass = REData.classes[9].id;  // TODO:
        for (const race of REData.races) RESetup.setupRace(race);

        // Import Actors
        //REData.actors = [];
        $dataActors.forEach(x => {
            if (x) {
                const [entity, actor] = REData.newActor();
                entity.display.name = x.name;
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.factionId = REData.system.factions.neutral;
                entity.selfTraits = x.traits.slice();
                entity.classId = x.classId;
                actor.setup(x);
                this.setupDirectly_Actor(actor);
            }
        });
        REData.entities[REData.actors[1]].factionId = REData.system.factions.player;    // #1 はデフォルトで Player
        

        // Import Skills
        //   Item から Skill を参照することがある。逆は無いため、Item より先に Skill を構築する。
        REData.skills = [];
        $dataSkills.forEach(x => {
            const skill = new DSkill(REData.skills.length);
            REData.skills.push(skill);
            if (x) {
                skill.parseMetadata(x.meta);

                const emittor = REData.newEmittor(skill.key);
                const effect = new DEffect(skill.key);
                effect.critical = false;
                effect.successRate = x.successRate;
                effect.hitType = x.hitType;
                effect.rmmzAnimationId = x.animationId;
                effect.rmmzSpecialEffectQualifyings = x.effects;

                emittor.costs.setParamCost(DSkillCostSource.Actor, REBasics.params.mp, {type: DParamCostType.Decrease, value: x.mpCost});
                emittor.costs.setParamCost(DSkillCostSource.Actor, REBasics.params.tp, {type: DParamCostType.Decrease, value: x.tpCost});

                if (x.damage.type > 0) {
                    effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }
                emittor.effectSet.effects.push(effect);

                skill.name = x.name;
                skill.emittorId = emittor.id;
                skill.rmmzEffectScope = x.scope ?? DRmmzEffectScope.None;
                skill.message1 = x.message1;
                skill.message2 = x.message2;

                if (DHelpers.isForFriend(skill.rmmzEffectScope)) {
                //if (DHelpers.isSingle(skill.rmmzEffectScope)) {
                    emittor.scope.range = DEffectFieldScopeRange.Performer;
                }
            }
        });
        
        // Import Item
        REData.items = [];
        REData.itemDataIdOffset = REData.items.length;
        $dataItems.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);

                const emittor = REData.newEmittor(entity.entity.key);
                const effect = new DEffect(entity.entity.key);
                effect.critical = false;
                effect.successRate = x.successRate;
                effect.hitType = x.hitType;
                effect.rmmzAnimationId = x.animationId;
                effect.rmmzSpecialEffectQualifyings = x.effects;

                if (x.damage.type > 0) {
                    effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }
                //effect.rmmzItemEffectQualifying = x.effects.
                emittor.effectSet.effects.push(effect);

                entity.setMainEmittor(emittor);
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

                const rmmzScope = x.scope ?? DRmmzEffectScope.None;
                //item.animationId = x.animationId;

                if (DHelpers.isForFriend(rmmzScope)) {
                    emittor.scope.range = DEffectFieldScopeRange.Performer;
                }
            }
        });
        REData.weaponDataIdOffset = REData.items.length;
        $dataWeapons.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.display.name = DHelpers.parseDisplayName(x.name);
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);
                entity.equipment = new DEquipment();
                entity.equipment.equipmentPart = x.etypeId;
                entity.equipment.parameters[REBasics.params.hp] = { value: x.params[0], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.mp] = { value: x.params[1], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.atk] = { value: x.params[2], upgradeRate: 1.0 };
                entity.equipment.parameters[REBasics.params.def] = { value: x.params[3], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.mat] = { value: x.params[4], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.mdf] = { value: x.params[5], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.agi] = { value: x.params[6], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.luk] = { value: x.params[7], upgradeRate: 0 };
                entity.equipmentTraits = x.traits.slice();
                entity.equipmentTraits = entity.equipmentTraits.concat(DTrait.parseTraitMetadata(x.meta));
                entity.entity = parseMetaToEntityProperties(x.meta);

                // 投げ当て Effect
                // TODO: ここでいいの？
                // const emittor = REData.newEmittor();
                // emittor.scope.range = DEffectFieldScopeRange.Performer;
                // const effect = new DEffect();
                // effect.critical = false;
                // effect.successRate = 100;
                // effect.hitType = DEffectHitType.Physical;
                // const q: DParameterQualifying = {
                //     parameterId: REBasics.params.hp,
                //     applyTarget: DParameterApplyTarget.Current,
                //     elementId: 0,
                //     formula: "89",
                //     applyType: DParameterEffectApplyType.Damage,
                //     variance: 20,
                //     silent: false,
                // };
                // effect.qualifyings.parameterQualifyings.push(q);
                // emittor.effectSet.effects.push(effect);
                // entity.emittorSet.addEmittor(DEffectCause.Hit, emittor);
            }
        });
        REData.armorDataIdOffset = REData.items.length;
        $dataArmors.forEach(x => {
            const [entity, item] = REData.newItem();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);
                entity.equipment = new DEquipment();
                entity.equipment.equipmentPart = x.etypeId;
                entity.equipment.parameters[REBasics.params.hp] = { value: x.params[0], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.mp] = { value: x.params[1], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.atk] = { value: x.params[2], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.def] = { value: x.params[3], upgradeRate: 1.0 };
                entity.equipment.parameters[REBasics.params.mat] = { value: x.params[4], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.mdf] = { value: x.params[5], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.agi] = { value: x.params[6], upgradeRate: 0 };
                entity.equipment.parameters[REBasics.params.luk] = { value: x.params[7], upgradeRate: 0 };
                entity.equipmentTraits = x.traits.slice();
                entity.equipmentTraits = entity.equipmentTraits.concat(DTrait.parseTraitMetadata(x.meta));
                entity.entity = parseMetaToEntityProperties(x.meta);
            }
        });
        RESystem.items = {
            autoSupplyFood: 2,
        };
        REData.system.initialPartyMembers = [];
        for (const actorId of $dataSystem.partyMembers) {
            const entity = REData.entities.find(x => x.actor && x.actor.rmmzActorId == actorId);
            assert(entity);
            REData.system.initialPartyMembers.push(entity.id);
        }

        // Import Enemies
        $dataEnemies.forEach(x => {
            const [entity, enemy] = REData.newEnemy();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = 71;
                enemy.exp = x.exp;
                if (x.params) {
                    //enemy.idealParams = x.params;
                    
                    entity.idealParams[REBasics.params.hp] = x.params[0];
                    entity.idealParams[REBasics.params.mp] = x.params[1];
                    entity.idealParams[REBasics.params.atk] = x.params[2];
                    entity.idealParams[REBasics.params.def] = x.params[3];
                    entity.idealParams[REBasics.params.mat] = x.params[4];
                    entity.idealParams[REBasics.params.mdf] = x.params[5];
                    entity.idealParams[REBasics.params.agi] = x.params[6];
                    entity.idealParams[REBasics.params.luk] = x.params[7];
                    
                }
                enemy.traits = x.traits;
                enemy.actions = x.actions;
                enemy.dropItems = DDropItem.makeFromRmmzDropItemList(x.dropItems, x.gold);
                entity.entity = parseMetaToEntityProperties(x.meta);    // TODO: ↓DMetadataParserを使う
                entity.entity.kindId = REBasics.entityKinds.MonsterKindId;
                entity.factionId = REData.system.factions.enemy;
                entity.classId =  REBasics.defaultEnemyClass;

                enemy.traits = enemy.traits.concat(DTrait.parseTraitMetadata(x.meta));

                const meta = DMetadataParser.parse(x.meta);
                entity.raceIds = meta.races.map(x => REData.getRace(x).id);

                RESetup.setupEnemy(entity);
            }
        });

        // Import Lands
        // 最初に Land を作る
        REData.lands = [];
        REData.lands.push(new DLand(0)); // [0] dummy

        
        const defaltLand = new DLand(1);
        REData.lands.push(defaltLand); // [1] REシステム管理外の RMMZ マップを表す Land
        
        {
            const level = DLandIdentificationLevel.Entity;
            for (const kind of REData.entityKinds) {
                defaltLand.identifiedKinds[kind.id] = level;
            }
        }

        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("MR-Land:")) {
                const land = new DLand(REData.lands.length);
                land.name = info.name;
                land.rmmzMapId = i;
                REData.lands.push(land);
            }
        }

        // Floor 情報を作る
        // ※フロア数を Land マップの width としているが、これは MapInfo から読み取ることはできず、
        //   全マップを一度ロードする必要がある。しかしそうすると処理時間が大きくなってしまう。
        //   ひとまず欠番は多くなるが、最大フロア数でデータを作ってみる。
        {
            // 固定マップ
            //REData.maps = new Array($dataMapInfos.length);
            for (let i = 1; i < $dataMapInfos.length; i++) {
                const info = $dataMapInfos[i];
                
                const mapData = REData.newMap();
                mapData.landId = DHelpers.RmmzNormalMapLandId;
                // DMap = {
                //     id: i, landId: , mapId: 0, mapKind: REFloorMapKind.FixedMap, exitMap: false, defaultSystem: false, eventMap: false,
                // };
                //REData.maps[i] = mapData;

                if (!info) {
                    // Map 無し。mapId は 0 のまま。
                    continue;
                }
                else {
                    mapData.mapId = i;
                }

                assert(mapData.id == i);

                if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else {
                    if (info.name?.startsWith("MR-Safety:")) {
                        mapData.safetyMap = true;
                    }

                    // 以下、必ず親Mapが必要なもの
                    const parentInfo = $dataMapInfos[info.parentId];
                    if (parentInfo) {
                        if (info.parentId > 0 && parentInfo.name.includes("MR-MapTemplates")) {
                            mapData.mapKind = REFloorMapKind.TemplateMap;
                            REData.templateMaps.push({
                                ...DTemplateMap_Default(),
                                id: REData.templateMaps.length,
                                name: info.name,
                                mapId: mapData.id,
                            });
                        }
                        else if (info.name?.startsWith("MR-Land:")) {
                            const land = REData.lands.find(x => x.rmmzMapId == i);
                            assert(land);
                            mapData.landId = land.id;
                            mapData.mapKind = REFloorMapKind.Land;
                        }
                        else if (info.parentId) {
                            const land = REData.lands.find(x => parentInfo && parentInfo.parentId && x.rmmzMapId == parentInfo.parentId);
                            if (land) {
                                mapData.landId = land.id;
                                if (parentInfo.name.includes("[Random]")) {
                                    mapData.mapKind = REFloorMapKind.RandomMap;
                                }
                                else if (parentInfo.name.includes("[Shuffle]")) {
                                    mapData.mapKind = REFloorMapKind.ShuffleMap;
                                }
                                else if (parentInfo.name.includes("[Fixed]")) {
                                    mapData.mapKind = REFloorMapKind.FixedMap;
                                    land.fixedMapIds.push(mapData.id);
                                }
                            }
                        }
                                
                        if (info.name?.includes("ExitMap")) {
                            mapData.exitMap = true;
                            mapData.landId = DHelpers.RmmzNormalMapLandId;
                        }


                        DDataImporter.importMapData(
                            mapData, info, parentInfo,
                            parentInfo.parentId > 0 ? $dataMapInfos[parentInfo.parentId] : undefined);
                    }
                }

                // null 回避のため、REシステム管理外のマップの FloorInfo を作っておく
                if (mapData.landId == DHelpers.RmmzNormalMapLandId) {
                    REData.lands[DHelpers.RmmzNormalMapLandId].floorInfos[mapData.mapId] = {
                        key: "",
                        template: undefined,
                        displayName: undefined,
                        fixedMapName: "", safetyActions: true, bgmName: "", bgmVolume: 90, bgmPitch: 100,
                        monsterHouse: new DFloorMonsterHouse(undefined),
                        presetId: 0,
                    };
                }
            }
        }

        // 検証
        for (const land of REData.lands) {
            if (land.id > 0 && land.id != DHelpers.RmmzNormalMapLandId) {
                if (land.exitRMMZMapId == 0) {
                    throw new Error(`Land[${land.name}] is MR-ExitMap not defined.`);
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
                troop.members = x.members.map(m => REData.enemies[m.enemyId]);
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

        this.loadDataFile("mr/Pseudonymous.json", (obj) => REData.pseudonymous.setup(obj));

        // Load Prefabs
        this.beginLoadPrefabs();

        // Load Template Map
        for (const templateMap of REData.templateMaps) {
            this.beginLoadTemplateMap(templateMap);
        }

        this.beginLoadSetupScript();
    }

    private static beginLoadPrefabs(): void {
        assert(this.databaseMapId > 0);
        this.beginLoadMapData(this.databaseMapId, (obj: any) => { 
            const mapData: IDataMap = obj;
            for (const event of mapData.events) {
                if (!event) continue;
                const data = DAnnotationReader.readPrefabMetadata(event, this.databaseMapId);
                if (!data) continue;

                const prefab =  REData.newPrefab();
                prefab.key = event.name;
                prefab.rmmzMapId = this.databaseMapId;
                prefab.rmmzEventData = event;

                prefab.image.characterName = event.pages[0].image.characterName;
                prefab.image.direction = event.pages[0].image.direction;
                prefab.image.pattern = event.pages[0].image.pattern;
                prefab.image.characterIndex = event.pages[0].image.characterIndex;
                prefab.image.directionFix = event.pages[0].directionFix;
                prefab.image.stepAnime = event.pages[0].stepAnime;
                prefab.image.walkAnime = event.pages[0].walkAnime;
                if (data.stateImages) {
                    prefab.stateImages = data.stateImages.map(x => { return { stateId: REData.getState(x[0]).id, characterName: x[1], characterIndex: x[2]}; });
                }
                if (event.pages[0].moveType == 3) { // TODO: 仮
                    prefab.moveType = DPrefabMoveType.Fix;
                }

                REData.prefabs.push(prefab);

                for (let i = 1; i < event.pages.length; i++) {
                    const pageData = DAnnotationReader.readPrefabSubPageMetadata(event.pages[i]);
                    if (pageData) {
                        if (pageData.state === undefined) throw new Error(`@MR-PrefabSubPage requires state field.`);
                        prefab.subPages.push({ stateId: REData.getState(pageData.state).id, rmmzEventPageIndex: i });
                    }
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
                                RESetup.setupPrefab(prefab);
                            }
                            else {
                                throw new Error(`Unknown Prefab "${entity.entity.meta_prefabName}".`);
                            }
                        }
                        else {
                            //throw new Error(`No prefab specified. "${entity.entity.key}"`);
                        }


                    }
                }
            }

            REBasics.prefabs = {
                illusionActor: REData.getPrefab("pまどわしUnit").id,
                illusionItem: REData.getPrefab("pまどわしItem").id,
            };
            
            // Load Land database
            for (const land of REData.lands) {
                DDataImporter.beginLoadLandDatabase(land);
            }
        });
    }

    private static beginLoadTemplateMap(templateMap: DTemplateMap): void {
        if (templateMap.mapId > 0) this.beginLoadMapData(templateMap.mapId, (obj: any) => { buildTemplateMapData(obj, templateMap); });
    }

    
    public static beginLoadMapData(rmmzMapId: number, onLoad: (obj: any) => void) {
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

    public static beginLoadSetupScript(): void {
        this.loadTextFile("mr/Setup.js", (obj) => {
            const scriptDB = new DSetupScript(obj);

            
            // SystemState 等を参照したいので、System の Link の後で。
            for (const skill of REData.skills) {
                RESetup.setupDirectly_Skill(skill)
            }
            REData.skills.forEach(x => RESetup.linkSkill(x));

            for (const item of REData.items) {
                scriptDB.setupItem(REData.entities[item]);
            }

            for (const item of REData.items) {
                RESetup.setupDirectly_DItem(REData.entities[item]);
            }

            for (const id of REData.actors) {
                if (id > 0) RESetup.setupActor(REData.entities[id]);
            }

            // Skill を参照するので、Skill の Link の後で。
            for (const id of REData.items) {
                RESetup.linkItem(REData.entities[id]);
            }

        });
    }

    public static padZero(v: number, length: number) {
        return String(v).padStart(length, "0");
    }

    static makeParameterQualifying(damage: IDataDamage): DParameterQualifying {
        let parameterId = 0;
        let applyType = DParameterEffectApplyType.None;
        switch (damage.type) {
            case 1: // HPダメージ
                parameterId = REBasics.params.hp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 2: // MPダメージ
                parameterId = REBasics.params.mp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 3: // HP回復
                parameterId = REBasics.params.hp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 4: // MP回復
                parameterId = REBasics.params.mp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 5: // HP吸収
                parameterId = REBasics.params.hp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            case 6: // MP吸収
                parameterId = REBasics.params.mp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            default:
                throw new Error();
        }
        const param = new DParameterQualifying(parameterId, damage.formula ?? "0", applyType);
        param.elementId = damage.elementId ?? 0;
        param.variance = damage.variance ?? 0;
        return param;
        // return {
        //         parameterId: parameterId,
        //         applyTarget: DParameterApplyTarget.Current,
        //         elementId: damage.elementId ?? 0,
        //         formula: damage.formula ?? "0",
        //         applyType: applyType,
        //         variance: damage.variance ?? 0,
        //         silent: false,
        // };
    }

    static floor(mapId: number): DMap {
        return REData.maps[mapId];
    }

    static isDatabaseMap(mapId: DMapId) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("MR-Prefabs"))
            return true;
        else
            return false;
    }

    static isLandMap(mapId: DMapId) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("MR-Land:"))
            return true;
        else
            return false;
    }

    static isRESystemMap(mapId: DMapId) : boolean {
        const map = REData.maps[mapId];
        if (map.eventMap) return false;
        return map.landId > DHelpers.RmmzNormalMapLandId;
    }

    static isFloorMap(mapId: DMapId) : boolean {
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
            const dataDir = "data/";//REData.testMode ? "../data/" : "data/";
            const data = JSON.parse(fs.readFileSync(dataDir + src).toString());
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
    private static loadTextFile(src: string, onLoad: (obj: string) => void) {
        if (DHelpers.isNode()) {
            const dataDir = "data/";
            onLoad(fs.readFileSync(dataDir + src).toString());
        }
        else {
            throw new Error("Not implemented.");
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

    static setupDirectly_Actor(data: RE_Data_Actor) {
        switch (data.id) {
            case 1:
                //data.traits.push({ code: DTraits.Proficiency, dataId: REData.getEntityKind("Grass").id, value: 2.0 });
                //data.traits.push({ code: DTraits.EquipmentProficiency, dataId: REData.getEntityKind("Shield").id, value: 0.1 });
                break;
        }
    }


}
