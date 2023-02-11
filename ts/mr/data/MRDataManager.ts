import fs from 'fs';
import { MRSystem } from "ts/mr/system/MRSystem";
import { assert, tr, tr2 } from "../Common";
import { MRData } from "./MRData";
import { MRBasics } from "./MRBasics";
import { DState, DStateRestriction } from "./DState";
import { DEquipmentType_Default } from "./DEquipmentType";
import { DAbility, DAbility_Default } from "./DAbility";
import { parseMetaToEntityProperties } from "./DEntityProperties";
import { DFloorClass, DFloorMode, DLand, DLandIdentificationLevel } from "./DLand";
import { DHelpers } from "./DHelper";
import { DPrefabMoveType } from "./DPrefab";
import { DEquipment } from './DItem';
import { DTrait } from './DTrait';
import { DRmmzEffectScope, DParameterEffectApplyType, DParameterQualifying, DEffectFieldScopeType, DSkillCostSource, DParamCostType } from './DEffect';
import { DFovSystem, DSystem } from './DSystem';
import { DSkill } from './DSkill';
import { DTroop } from './DTroop';
import { DStateGroup } from './DStateGroup';
import { MRSetup } from './MRSetup';
import { DElement } from './DElement';
import { DParamMessageValueSource, DParameter, DParameterType } from './DParameter';
import { DDataImporter, DLandMapDataDirectory, DMapDataNodeLeafType, DMapDataNodeRootType } from './DDataImporter';
import { DDropItem } from './DEnemy';
import { DTextManager } from './DTextManager';
import { DAnnotationReader } from './importers/DAnnotationReader';
import { DMetadataParser } from './importers/DMetadataParser';
import { DSetupScript } from './importers/DSetupScript';
import { DSectorConnectionPreset, FGenericRandomMapWayConnectionMode } from './DTerrainPreset';
import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from '../PluginParameters';
import { DTerrainSettingImporter } from './importers/DTerrainSettingImporter';
import { DFloorPresetImporter } from './importers/DFloorPresetImporter';
import { DFlavorEffect, DSound } from './DFlavorEffect';
import { DValidationHelper } from './DValidationHelper';
import { DMapId } from './DCommon';
import { REFloorMapKind } from './DMap';
import { DEffectRef } from './DEffectSuite';
import { DQuestTask } from './DQuest';
import { DScript } from './DScript';

type NextFunc = () => void;
type TaskFunc = (next: NextFunc) => void;

export class MRDataManager {
    public static testMode: boolean;
    public static databaseMapId: number = 0;

    private static _loadTasks: (TaskFunc)[];
    private static _currentTask: (TaskFunc) | undefined;

    public static load(): void {
        // 各種データファイルの読み込みは非同期で行われることを想定しなければならないが、
        // RMMZ からインポートしたデータをさらに加工するにあたり、順序依存が必要になるものがある。
        // 愚直に実装するとコールバック地獄になるため、簡易的な Promise のような仕組みで、直列的に実行されるようにする。
        this._loadTasks = [];
        this._loadTasks.push((n) => this.setupCommonData(n));
        this._loadTasks.push((n) => this.loadData(n));
        this._loadTasks.push((n) => this.importTerrainSettings(n));
        this._loadTasks.push((n) => this.importFloorPreset(n));
        this._loadTasks.push((n) => this.importLandAndFloors(n));
        this._loadTasks.push((n) => this.importPseudonymous(n));
        this._loadTasks.push((n) => this.importPrefabs(n));
        this._loadTasks.push((n) => this.importLandDatabase(n));
        this._loadTasks.push((n) => this.importTemplateMaps(n));
        this._loadTasks.push((n) => this.importSetupScript(n));
        this._loadTasks.push((n) => this.notifyDatabaseReady(n));
        
        if (DHelpers.isNode()) {
            this._currentTask = this._loadTasks.shift();
            while (this._currentTask) {
                const task = this._currentTask;
                this._currentTask = undefined;
                task(() => this.nextFunc());
            }
        }
        else {
            this._currentTask = this._loadTasks.shift();
            assert(this._currentTask);
            this._currentTask(this.nextFunc);
        }
    }

    public static isImportCompleted(): boolean {
        return this._currentTask == undefined && this._loadingDataFileCount == this._loadedDataFileCount;
    }

    private static nextFunc() {
        if (this._loadTasks.length > 0) {
            this._currentTask = this._loadTasks.shift();
        }
        else {
            this._currentTask = undefined;
        }
    }














    private static setupCommonData(next: NextFunc) {
        MRData.reset();

        // Events
        {
            MRBasics.events = {
                roomEnterd: 1,
                roomLeaved: 2,
                preWalk: 3,
                walked: 4,
                prePut: 5,
                effectReacted: 6,
                skillEmitted: 7,
                itemRemovedFromInventory: 8,
            }
        }

        // Parameters
        MRData.parameters = [
            DParameter.makeBuiltin(0, "null", "null", "null", -1, 0, 0, Infinity, false),
            DParameter.makeBuiltin(1, "hp", "HP", tr2("最大HP"), 0, 0, 0, Infinity, true),
            DParameter.makeBuiltin(2, "mp", "MP", tr2("最大MP"), 1, 0, 0, Infinity, true),
            DParameter.makeBuiltin(3, "atk", "ATK", tr2("最大ATK"), 2, 0, 0, Infinity, true),
            DParameter.makeBuiltin(4, "def", "DEF", tr2("最大DEF"), 3, 0, 0, Infinity, true),
            DParameter.makeBuiltin(5, "mat", "MAT", tr2("最大MAT"), 4, 0, 0, Infinity, true),
            DParameter.makeBuiltin(6, "mdf", "MDF", tr2("最大MDF"), 5, 0, 0, Infinity, true),
            DParameter.makeBuiltin(7, "agi", "AGI", tr2("最大AGI"), 6, 0, -100, 200, true),
            DParameter.makeBuiltin(8, "luk", "LUK", tr2("最大LUK"), 7, 0, 0, Infinity, true),
            DParameter.makeBuiltin(9, "tp", "TP", tr2("最大TP"), 8, 0, 0, Infinity, true),
            //----------
            DParameter.makeBuiltin(10, "fp", tr2("満腹度"), tr2("最大満腹度"), -1, 10000, 0, Infinity, true),    // FP
            DParameter.makeBuiltin(11, "pow", tr2("ちから"), tr2("ちからの最大値"), -1, 8, 0, Infinity, true),   // Power
            DParameter.makeBuiltin(12, "upg", tr2("つよさ"), tr2("つよさの最大値"), -1, 99, -Infinity, Infinity, false),
            DParameter.makeBuiltin(13, "rem", tr2("回数"), tr2("最大回数"), -1, 99, 0, Infinity, false),
            DParameter.makeBuiltin(14, "cap", "Capacity", tr2("最大容量"), -1, 8, 0, Infinity, false),
            DParameter.makeBuiltin(15, "gold", "Gold", tr2("最大ゴールド"), -1, 999999, 10, Infinity, false),
            DParameter.makeBuiltin(16, "level", tr2("レベル"), tr2("レベル"), -1, 99, 1, Infinity, false),  // レベルアップは Growth に対して行うので、最大値名を "最大レベル" にしてしまうと、"Aは最大レベルが1上がった！"と表示されてしまう。
            DParameter.makeBuiltin(17, "exp", tr2("経験値"), tr2("最大経験値"), -1, 9999999, 0, Infinity, false),
        ];
        MRBasics.params = {
            hp: MRData.parameters.findIndex(x => x.code == "hp"),
            mp: MRData.parameters.findIndex(x => x.code == "mp"),
            atk: MRData.parameters.findIndex(x => x.code == "atk"),
            def: MRData.parameters.findIndex(x => x.code == "def"),
            mat: MRData.parameters.findIndex(x => x.code == "mat"),
            mdf: MRData.parameters.findIndex(x => x.code == "mdf"),
            agi: MRData.parameters.findIndex(x => x.code == "agi"),
            luk: MRData.parameters.findIndex(x => x.code == "luk"),
            tp: MRData.parameters.findIndex(x => x.code == "tp"),
            fp: MRData.parameters.findIndex(x => x.code == "fp"),
            pow: MRData.parameters.findIndex(x => x.code == "pow"),
            upgradeValue: MRData.parameters.findIndex(x => x.code == "upg"),
            remaining: MRData.parameters.findIndex(x => x.code == "rem"),
            capacity: MRData.parameters.findIndex(x => x.code == "cap"),
            gold: MRData.parameters.findIndex(x => x.code == "gold"),
            level: MRData.parameters.findIndex(x => x.code == "level"),
            exp: MRData.parameters.findIndex(x => x.code == "exp"),
        };
        // RMMZ のパラメータID との一致を検証
        assert(MRData.parameters[MRBasics.params.hp].battlerParamId === 0);
        assert(MRData.parameters[MRBasics.params.mp].battlerParamId === 1);
        assert(MRData.parameters[MRBasics.params.atk].battlerParamId === 2);
        assert(MRData.parameters[MRBasics.params.def].battlerParamId === 3);
        assert(MRData.parameters[MRBasics.params.mat].battlerParamId === 4);
        assert(MRData.parameters[MRBasics.params.mdf].battlerParamId === 5);
        assert(MRData.parameters[MRBasics.params.agi].battlerParamId === 6);
        assert(MRData.parameters[MRBasics.params.luk].battlerParamId === 7);

        MRData.parameters[MRBasics.params.fp].magnification = 0.01;
        MRData.parameters[MRBasics.params.fp].friendlySideMessages = [
            { condition: "value >= max", message: tr("%1はおなかがいっぱいになった。") },
            { condition: "value < max", message: tr("%1はおなかがふくれた。") }
        ];
        MRData.parameters[MRBasics.params.pow].selfGainMessage = DTextManager.actorGain;
        MRData.parameters[MRBasics.params.pow].selfLossMessage = DTextManager.actorLoss;
        MRData.parameters[MRBasics.params.pow].targetGainMessage = DTextManager.actorGain;
        MRData.parameters[MRBasics.params.pow].targetLossMessage = DTextManager.enemyLoss;
        MRData.parameters[MRBasics.params.upgradeValue].selfGainMessage = DTextManager.actorGain;
        MRData.parameters[MRBasics.params.upgradeValue].selfLossMessage = DTextManager.actorLoss;
        MRData.parameters[MRBasics.params.upgradeValue].targetGainMessage = DTextManager.actorGain;
        MRData.parameters[MRBasics.params.upgradeValue].targetLossMessage = DTextManager.enemyLoss;
        MRData.parameters[MRBasics.params.level].initialValue = 1;
        //MRData.parameters[MRBasics.params.level].type = DParameterType.Dependent;
        MRData.parameters[MRBasics.params.level].allowDamage = false;
        MRData.parameters[MRBasics.params.level].initialIdealValue = 0;
        MRData.parameters[MRBasics.params.level].maxEffortLimit = 99;
        MRData.parameters[MRBasics.params.exp].initialValue = 0;
        MRData.parameters[MRBasics.params.level].selfGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].selfLossMessage = DTextManager.actorLoss;
        MRData.parameters[MRBasics.params.level].targetGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].targetLossMessage = DTextManager.enemyLoss;
        MRData.parameters[MRBasics.params.level].messageValueSource = DParamMessageValueSource.Absolute;
        
        for (const param of MRData.parameters) {
            MRSetup.setupParameter(param);
        }
        
        MRBasics.entityCategories = {
            actor: MRData.newEntityCategory("kEntityCategory_Actor", "Actor").id,
            WeaponKindId: MRData.newEntityCategory("kEntityCategory_Weapon", "武器").id,
            ShieldKindId: MRData.newEntityCategory("kEntityCategory_Shield", "盾").id,
            armor: MRData.newEntityCategory("kEntityCategory_Armor", "盾").id,
            ArrowKindId: MRData.newEntityCategory("kEntityCategory_Arrow", "矢").id,
            //RE_Data.addEntityKind("石"),
            //RE_Data.addEntityKind("弾"),
            BraceletKindId: MRData.newEntityCategory("kEntityCategory_Ring", "腕輪").id,
            FoodKindId: MRData.newEntityCategory("kEntityCategory_Food", "食料").id,
            grass: MRData.newEntityCategory("kEntityCategory_Grass", "草").id,
            ScrollKindId: MRData.newEntityCategory("kEntityCategory_Scroll", "巻物").id,
            WandKindId: MRData.newEntityCategory("kEntityCategory_Staff", "杖").id,
            PotKindId: MRData.newEntityCategory("kEntityCategory_Pot", "壺").id,
            DiscountTicketKindId: MRData.newEntityCategory("kEntityCategory_DiscountTicket", "割引券").id,
            BuildingMaterialKindId: MRData.newEntityCategory("kEntityCategory_BuildingMaterial", "材料").id,
            TrapKindId: MRData.newEntityCategory("kEntityCategory_Trap", "罠").id,
            FigurineKindId: MRData.newEntityCategory("kEntityCategory_Figurine", "土偶").id,
            MonsterKindId: MRData.newEntityCategory("kEntityCategory_Enemy", "モンスター").id,
            entryPoint: MRData.newEntityCategory("kEntityCategory_EntryPoint", "入り口").id,
            exitPoint: MRData.newEntityCategory("kEntityCategory_ExitPoint", "出口").id,
            Ornament: MRData.newEntityCategory("kEntityCategory_Ornament", "Ornament").id,
        };

        MRBasics.xparams = { // RMMZ と同じ配列
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

        MRBasics.sparams = { // RMMZ と同じ配列
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
            MRData.traits = [];
            MRBasics.traits = {} as any;
            MRData.traits[11] = new DTrait(11, "TRAIT_ELEMENT_RATE");
            MRBasics.traits.TRAIT_ELEMENT_RATE = 11;
            MRData.traits[12] = new DTrait(12, "TRAIT_DEBUFF_RATE");
            MRBasics.traits.TRAIT_DEBUFF_RATE = 12;
            MRData.traits[13] = new DTrait(13, "TRAIT_STATE_RATE");
            MRBasics.traits.TRAIT_STATE_RATE = 13;
            MRData.traits[14] = new DTrait(14, "TRAIT_STATE_RESIST");
            MRBasics.traits.TRAIT_STATE_RESIST = 14;
            MRData.traits[21] = new DTrait(21, "TRAIT_PARAM");
            MRBasics.traits.TRAIT_PARAM = 21;
            MRData.traits[22] = new DTrait(22, "TRAIT_XPARAM");
            MRBasics.traits.TRAIT_XPARAM = 22;
            MRData.traits[23] = new DTrait(23, "TRAIT_SPARAM");
            MRBasics.traits.TRAIT_SPARAM = 23;
            MRData.traits[31] = new DTrait(31, "TRAIT_ATTACK_ELEMENT");
            MRBasics.traits.TRAIT_ATTACK_ELEMENT = 31;
            MRData.traits[32] = new DTrait(32, "TRAIT_ATTACK_STATE");
            MRBasics.traits.TRAIT_ATTACK_STATE = 32;
            MRData.traits[33] = new DTrait(33, "TRAIT_ATTACK_SPEED");
            MRBasics.traits.TRAIT_ATTACK_SPEED = 33;
            MRData.traits[34] = new DTrait(34, "TRAIT_ATTACK_TIMES");
            MRBasics.traits.TRAIT_ATTACK_TIMES = 34;
            MRData.traits[35] = new DTrait(35, "TRAIT_ATTACK_SKILL");
            MRBasics.traits.TRAIT_ATTACK_SKILL = 35;
            MRData.traits[41] = new DTrait(41, "TRAIT_STYPE_ADD");
            MRBasics.traits.TRAIT_STYPE_ADD = 41;
            MRData.traits[42] = new DTrait(42, "TRAIT_STYPE_SEAL");
            MRBasics.traits.TRAIT_STYPE_SEAL = 42;
            MRData.traits[43] = new DTrait(43, "TRAIT_SKILL_ADD");
            MRBasics.traits.TRAIT_SKILL_ADD = 43;
            MRData.traits[44] = new DTrait(44, "TRAIT_SKILL_SEAL");
            MRBasics.traits.TRAIT_SKILL_SEAL = 44;
            MRData.traits[51] = new DTrait(51, "TRAIT_EQUIP_WTYPE");
            MRBasics.traits.TRAIT_EQUIP_WTYPE = 51;
            MRData.traits[52] = new DTrait(52, "TRAIT_EQUIP_ATYPE");
            MRBasics.traits.TRAIT_EQUIP_ATYPE = 52;
            MRData.traits[53] = new DTrait(53, "TRAIT_EQUIP_LOCK");
            MRBasics.traits.TRAIT_EQUIP_LOCK = 53;
            MRData.traits[54] = new DTrait(54, "TRAIT_EQUIP_SEAL");
            MRBasics.traits.TRAIT_EQUIP_SEAL = 54;
            MRData.traits[55] = new DTrait(55, "TRAIT_SLOT_TYPE");
            MRBasics.traits.TRAIT_SLOT_TYPE = 55;
            MRData.traits[61] = new DTrait(61, "TRAIT_ACTION_PLUS");
            MRBasics.traits.TRAIT_ACTION_PLUS = 61;
            MRData.traits[62] = new DTrait(62, "TRAIT_SPECIAL_FLAG");
            MRBasics.traits.TRAIT_SPECIAL_FLAG = 62;
            MRData.traits[63] = new DTrait(63, "TRAIT_COLLAPSE_TYPE");
            MRBasics.traits.TRAIT_COLLAPSE_TYPE = 63;
            MRData.traits[64] = new DTrait(64, "TRAIT_PARTY_ABILITY");
            MRBasics.traits.TRAIT_PARTY_ABILITY = 64;

            MRBasics.traits._separator = MRData.newTrait("_separator").id;
            MRBasics.traits.CertainDirectAttack = MRData.newTrait("CertainDirectAttack").id;
            MRBasics.traits.DodgePhysicalIndirectAttack = MRData.newTrait("CartailDodgePhysicalAttack").id;
            MRBasics.traits.AwfulPhysicalIndirectAttack = MRData.newTrait("AwfulPhysicalIndirectAttack").id;
            MRBasics.traits.UnitVisitor = MRData.newTrait("UnitVisitor").id;
            MRBasics.traits.StateRemoveByEffect = MRData.newTrait("StateRemoveByEffect").id;
            MRBasics.traits.Stackable = MRData.newTrait("Stackable").id;
            MRBasics.traits.EffectProficiency = MRData.newTrait("EffectProficiency").id;
            MRBasics.traits.EquipmentProficiency = MRData.newTrait("EquipmentProficiency").id;
            MRBasics.traits.SealActivity = MRData.newTrait("SealActivity").id;
            MRBasics.traits.SealSpecialAbility = MRData.newTrait("SealSpecialAbility").id;
            MRBasics.traits.Invisible = MRData.newTrait("Invisible").id;
            MRBasics.traits.ForceVisible = MRData.newTrait("ForceVisible").id;
            MRBasics.traits.ItemDropRate = MRData.newTrait("ItemDropRate").id;
            MRBasics.traits.FixedDamage = MRData.newTrait("FixedDamage").id;
            MRBasics.traits.DrawInTrap = MRData.newTrait("DrawInTrap").id;
            MRBasics.traits.AwakeStep = MRData.newTrait("AwakeStep").id;
            MRBasics.traits.SilentStep = MRData.newTrait("SilentStep").id;
            MRBasics.traits.SuddenSkillEffect = MRData.newTrait("AutoSkillEffect").id;
            MRBasics.traits.SurvivalParamLossRate = MRData.newTrait("SurvivalParamLossRate").id;
            MRBasics.traits.ParamDamageRate = MRData.newTrait("ParamDamageRate").id;
            MRBasics.traits.SkillGuard = MRData.newTrait("SkillGuard").id;
            MRBasics.traits.DisableTrap = MRData.newTrait("DisableTrap").id;
            //REBasics.traits.RecoverRate = REData.newTrait("RecoverRate").id;
            //REBasics.traits.ElementedRecoverRate = REData.newTrait("ElementedRecoverRate").id;
            MRBasics.traits.ElementedRecoveryRate = MRData.newTrait("ElementedRecoverRate").id;
            MRBasics.traits.RaceRate = MRData.newTrait("RaceRate").id;
            MRBasics.traits.PhysicalProjectileReflector = MRData.newTrait("PhysicalProjectileReflector").id;
            MRBasics.traits.PenetrationItem = MRData.newTrait("PenetrationItem").id;
            MRBasics.traits.PenetrationThrower = MRData.newTrait("PenetrationThrower").id;
            MRBasics.traits.DeathVulnerableElement = MRData.newTrait("DeathVulnerableElement").id;
            MRBasics.traits.ForceParameter = MRData.newTrait("ForceParameter").id;
            MRBasics.traits.DisableMovement = MRData.newTrait("DisableMovement").id;
        }

        // Factions
        {
            MRData.factions = [
                { id: 0, name: '', schedulingOrder: 9999, hostileBits: 0, friendBits: 0 },
                { id: 1, name: 'Friends', schedulingOrder: 1, hostileBits: 0b0100, friendBits: 0 },
                { id: 2, name: 'Enemy', schedulingOrder: 2, hostileBits: 0b0010, friendBits: 0 },
                { id: 3, name: 'Neutral', schedulingOrder: 3, hostileBits: 0, friendBits: 0 },
            ];
        }

        // // Actions
        // MRBasics.actions = {
        //     DirectionChangeActionId: MRData.newAction("kAction_DirectionChange", "DirectionChange").id,
        //     MoveToAdjacentActionId: MRData.newAction("kAction_MoveToAdjacent", "MoveToAdjacent").id,
        //     PickActionId: MRData.newAction("kAction_Pick", "拾う").id,
        //     PutActionId: MRData.newAction("kAction_Put", "置く").id,
        //     ExchangeActionId: MRData.newAction("kAction_Exchange", "交換").id,
        //     ThrowActionId: MRData.newAction("kAction_Throw", "投げる").id,
        //     FlungActionId: MRData.newAction("kAction_Flung", "Flung").id,
        //     ShootActionId: MRData.newAction("kAction_Shoot", "撃つ", 1000).id,
        //     AffectActionId: MRData.newAction("kAction_Affect", "Affect").id,
        //     RollActionId: MRData.newAction("kAction_Roll", "Roll").id,
        //     FallActionId: MRData.newAction("kAction_Fall", "Fall").id,
        //     DropActionId: MRData.newAction("kAction_Drop", "Drop").id,
        //     trample: MRData.newAction("kAction_Trample", "踏む").id,
        //     TrashActionId: MRData.newAction("kAction_Trash", "Trash").id,
        //     ForwardFloorActionId: MRData.newAction("kAction_ForwardFloor", "すすむ").id,
        //     BackwardFloorActionId: MRData.newAction("kAction_BackwardFloor", "戻る").id,
        //     EquipActionId: MRData.newAction("kAction_Equip", "装備", 1000).id,
        //     EquipOffActionId: MRData.newAction("kAction_EquipOff", "はずす").id,
        //     EatActionId: MRData.newAction("kAction_Eat", "食べる", 1000).id,
        //     TakeActionId: MRData.newAction("kAction_Take", "Take").id,
        //     BiteActionId: MRData.newAction("kAction_Bite", "Bite").id,
        //     ReadActionId: MRData.newAction("kAction_Read", "読む", 1000).id,
        //     WaveActionId: MRData.newAction("kAction_Wave", "振る", 1000).id,
        //     PushActionId: MRData.newAction("kAction_Push", "Push").id,
        //     PutInActionId: MRData.newAction("kAction_PutIn", "PickIn").id,
        //     PickOutActionId: MRData.newAction("kAction_PickOut", "PickOut").id,
        //     IdentifyActionId: MRData.newAction("kAction_Identify", "Identify").id,
        //     talk: MRData.newAction("kAction_Talk", "talk").id,
        //     collide: MRData.newAction("kAction_Collide", "collide").id,
        //     dialogResult: MRData.newAction("kAction_DialogResult", "dialogResult").id,
        //     stumble: MRData.newAction("kAction_Stumble", "stumble").id,
        //     dead: MRData.newAction("kAction_Dead", "dead").id,
        //     performSkill: MRData.newAction("kAction_PerformSkill", "PerformSkill").id,
        //     AttackActionId: MRData.newAction("kAction_Attack", "Attack").id,
        // };
        // MRData.actions[ MRBasics.actions.ShootActionId].flavorEffect.sound = new DSound({ name: "Crossbow", volume: 100, pitch: 100, pan: 0 });

        MRBasics.commands = {
            testPickOutItem: MRData.newCommand("testPickOutItem").id,
            testPutInItem: MRData.newCommand("testPutInItem").id,
        };
        
        // Sequels
        MRBasics.sequels = {
            idle: MRData.addSequel("idle"),
            MoveSequel: MRData.addSequel("Move"),
            blowMoveSequel: MRData.addSequel("BlowMove"),
            dropSequel: MRData.addSequel("BlowMove"),
            attack: MRData.addSequel("attack"),
            CollapseSequel: MRData.addSequel("Collapse"),
            commonStopped: MRData.addSequel("commonStopped"),
            asleep: MRData.addSequel("asleep"),
            escape: MRData.addSequel("escape"),
            earthquake2: MRData.addSequel("earthquake2"),
            useItem: MRData.addSequel("useItem"),
            explosion: MRData.addSequel("explosion"),
            down: MRData.addSequel("down"),
            warp: MRData.addSequel("warp"),
            stumble: MRData.addSequel("stumble"),
            jump: MRData.addSequel("stumble"),
        };
        MRData.sequels[MRBasics.sequels.MoveSequel].parallel = true;
        MRData.sequels[MRBasics.sequels.MoveSequel].fluidSequence = true;
        MRData.sequels[MRBasics.sequels.CollapseSequel].parallel = true;
        MRData.sequels[MRBasics.sequels.stumble].parallel = true;
        MRData.sequels[MRBasics.sequels.dropSequel].parallel = true;    // 転倒とアイテムドロップを並列実行したい
        MRData.sequels[MRBasics.sequels.jump].parallel = true;

        MRData.monsterHouses = [
            { id: 0, name: "null", bgm: { name: "", pan: 0, pitch: 100, volume: 90 } },
            { id: 1, name: "Fixed", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
            { id: 2, name: "Default", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
        ];
        MRBasics.monsterHouses = {
            fixed: 1,
            normal: 2,
        };

        MRData.itemShops = [
            { id: 0, name: "null", bgm: { name: "", pan: 0, pitch: 100, volume: 90 } },
            { id: 1, name: "Fixed", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
            { id: 2, name: "Default", bgm: { name: "Battle4", pan: 0, pitch: 100, volume: 90 } },
        ];
        MRBasics.itemShops = {
            fixed: 1,
            normal: 2,
        };

        MRBasics.effectBehaviors = {
            itemSteal: MRData.newEffectBehavior("ItemSteal").id,
            goldSteal: MRData.newEffectBehavior("GoldSteal").id,
            levelDown: MRData.newEffectBehavior("LevelDown").id,
            randomWarp: MRData.newEffectBehavior("RandomWarp").id,
            stumble: MRData.newEffectBehavior("Stumble").id,
            transferToNextFloor: MRData.newEffectBehavior("TransferToNextFloor").id,
            transferToLowerFloor: MRData.newEffectBehavior("TransferToLowerFloor").id,
            trapProliferation: MRData.newEffectBehavior("TrapProliferation").id,
            dispelEquipments: MRData.newEffectBehavior("DispelEquipments").id,
            changeInstance: MRData.newEffectBehavior("ChangeInstance").id,
            restartFloor: MRData.newEffectBehavior("RestartFloor").id,
            clarification: MRData.newEffectBehavior("Clarification").id,
            division: MRData.newEffectBehavior("Division").id,
            addState: MRData.newEffectBehavior("AddState").id,
            removeState: MRData.newEffectBehavior("RemoveState").id,
            removeStatesByIntentions: MRData.newEffectBehavior("RemoveStatesByIntentions").id,
            performeSkill: MRData.newEffectBehavior("PerformeSkill").id,
        };

        // EntityTemplate
        {
            MRData.newEntityTemplate("kEntityTemplate_Weapon", {
                type: "Weapon",
            });
            MRData.newEntityTemplate("kEntityTemplate_Shield", {
                type: "Shield",
            });
            MRData.newEntityTemplate("kEntityTemplate_Armor", {
                type: "Armor",
            });
            MRData.newEntityTemplate("kEntityTemplate_Accessory", {
                type: "Accessory",
            });
            MRData.newEntityTemplate("kEntityTemplate_Grass", {
                type: "Grass",
                recoverFP: 500,
            });
            MRData.newEntityTemplate("kEntityTemplate_Food", {
                type: "Food",
            });
        }

        {
            {
                const shape = MRData.newTerrainShape("kTerrainShape_Default");
                shape.wayConnectionMode = FGenericRandomMapWayConnectionMode.SectionEdge;
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_SimpleDefault");
                shape.wayConnectionMode = FGenericRandomMapWayConnectionMode.RoomEdge;
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_Small2x2");
                shape.width = Math.floor(paramRandomMapDefaultWidth * (2 / 3));
                shape.height = Math.floor(paramRandomMapDefaultHeight * (2 / 3));
                shape.divisionCountX = 2;
                shape.divisionCountY = 2;
                shape.roomCountMin = 3;
                shape.roomCountMax = 4;
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_GreatHall");
                shape.divisionCountX = 1;
                shape.divisionCountY = 1;
                shape.forceRoomShapes = [{typeName: "FullPlane"}];
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_HalfHall");
                shape.divisionCountX = 1;
                shape.divisionCountY = 1;
                shape.forceRoomShapes = [{typeName: "HalfPlane"}];
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_C");
                shape.divisionCountX = 3;
                shape.divisionCountY = 3;
                shape.connectionPreset = DSectorConnectionPreset.C;
            }
            {
                const shape = MRData.newTerrainShape("kTerrainShape_H");
                shape.divisionCountX = 3;
                shape.divisionCountY = 3;
                shape.connectionPreset = DSectorConnectionPreset.H;
            }


            //----------

            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_Default");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_Default").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_Test_DefaultMH");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_Default").id, rate: 1});
            //     setting.forceStructures = [{typeName: "MonsterHouse", rate: 100}];
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_SimpleDefault");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_SimpleDefault").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_Small2x2");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_Small2x2").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_GreatHall");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_GreatHall").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_HalfHall");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_HalfHall").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_Alphabet");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_C").id, rate: 1});
            // }
            // {
            //     const setting = REData.newTerrainSetting("kTerrainSetting_GreatHallMH");
            //     setting.shapeRefs.push({dataId: REData.getTerrainShape("kTerrainShape_GreatHall").id, rate: 1});
            //     setting.forceStructures = [{typeName: "MonsterHouse", rate: 100}];
            // }


            MRBasics.defaultTerrainPresetId = 1;
        }

        // Test
        {
            {
                const data = MRData.newQuest("kQuest_メインクエスト");
                data.tasks.push(new DQuestTask("kQuestTask_メインクエスト戦_1"));
            }
            {
                const data = MRData.newQuest("kQuest_ActorBからActorCへのお届け物");
                data.tasks.push(new DQuestTask("kQuestTask_ActorBからActorCへのお届け物_1"));
            }
            {
                const data = MRData.newQuest("kQuest_アイテムの納品");
                data.tasks.push(new DQuestTask("kQuestTask_アイテムの納品_1"));
            }
            {
                const data = MRData.newQuest("kQuest_特定フロアにいるモンスターの盗伐");
                data.tasks.push(new DQuestTask("kQuestTask_特定フロアにいるモンスターの盗伐_1"));
            }
            {
                const data = MRData.newQuest("kQuest_特定マップへ移動して殲滅戦");
                data.tasks.push(new DQuestTask("kQuestTask_特定マップへ移動して殲滅戦_1"));
            }
        }

        next();
    }

    private static loadData(next: NextFunc): void {
        MRData.system = new DSystem();

        // Import Elements
        MRData.elements = [];
        for (const x of $dataSystem.elements) { // [0] is "" (empty string).
            const tokens = x.split("##");
            let key = x;
            let name = x;
            if (tokens.length == 2) {
                name = tokens[0];
                key = tokens[1];
            }
            const data = MRData.newElement(key);
            data.name = name;
        }

        MRBasics.variables = {
            result: $dataSystem.variables.findIndex(x => x == "MR-CommndResult1"),
            landExitResult: $dataSystem.variables.findIndex(x => x == "MR-ExitResult"),
            landExitResultDetail: $dataSystem.variables.findIndex(x => x == "MR-ExitResultDetail"),
        };

        MRBasics.elements = {
            explosion: MRData.getElement("kElement_Explosion").id,
        };
        
        
        if ($dataSystem.equipTypes) {
            MRData.equipmentParts = $dataSystem.equipTypes.map((x, i) => {
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
            MRData.stateGroups = [new DStateGroup(0)];  // dummy
            for (const x of $dataStates) {
                const state = new DState(MRData.states.length);
                MRData.states.push(state);
                if (x) {
                    const meta = DMetadataParser.parse(x.meta);

                    if (meta.type == "StateGroup") {
                        const stateGroup = new DStateGroup(MRData.stateGroups.length);
                        stateGroup.name = x.name;
                        stateGroup.key = meta.key;
                        MRData.stateGroups.push(stateGroup);
                        MRSetup.setupDirectly_StateGroup(stateGroup);
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
                        if (x.removeByDamage) {
                            state.effect.damageRemovels.push({paramId: MRBasics.params.hp, chance: x.chanceByDamage});
                        }
                        state.import(x);
                    }
                }
            }

            MRBasics.states = {
                dead: 1,
                nap: MRData.getState("kState_System_kNap").id,
                trapPerformed: MRData.getState("kState_System_TrapPerformed").id,
                monsterHouseSleepStateId: MRData.getState("kState_System_kNap").id,
            };
        }
        
        // Import Abilities
        {
            MRData.abilities = $dataStates
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
                    const race = MRData.newRace();
                    race.key = meta.key;
                    race.name = x.name;
                    race.traits = x.traits ?? [];
                }
                else {
                    const id = MRData.newClass(x.name ?? "null");
                    const c = MRData.classes[id];
                    c.expParams = x.expParams ?? [];
                    c.params = x.params ?? [];
                    c.traits = x.traits ?? [];
                    c.learnings = x.learnings;
                }
            }
        });
        MRBasics.defaultEnemyClass = MRData.classes[9].id;  // TODO:
        for (const race of MRData.races) MRSetup.setupRace(race);

        // Import Actors
        //REData.actors = [];
        $dataActors.forEach(x => {
            if (x) {
                const [entity, actor] = MRData.newActor();
                entity.display.name = x.name;
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.factionId = MRData.system.factions.neutral;
                entity.selfTraits = x.traits.slice();
                entity.classId = x.classId;
                actor.setup(x);
            }
        });
        MRData.entities[MRData.actors[1]].factionId = MRData.system.factions.player;    // #1 はデフォルトで Player
        

        // Import Skills
        //   Item から Skill を参照することがある。逆は無いため、Item より先に Skill を構築する。
        MRData.skills = [new DSkill(0, "null")];
        $dataSkills.forEach(x => {
            if (x) {
                const meta = DMetadataParser.parse(x.meta);
                const skill = new DSkill(MRData.skills.length, meta.key);
                MRData.skills.push(skill);

                assert(x.id == skill.id);

                if (meta.type == "Activity") {
                    skill.isActivity = true;
                }

                const emittor = MRData.newEmittor(skill.key);
                const effect = MRData.newEffect(skill.key);
                effect.critical = false;
                effect.successRate = x.successRate;
                effect.hitType = x.hitType;
                //effect.rmmzAnimationId = x.animationId;
                effect.rmmzSpecialEffectQualifyings = x.effects;

                emittor.targetAreaAnimationId = x.animationId;
                emittor.costs.setParamCost(DSkillCostSource.Actor, MRBasics.params.mp, {type: DParamCostType.Decrease, value: x.mpCost});
                emittor.costs.setParamCost(DSkillCostSource.Actor, MRBasics.params.tp, {type: DParamCostType.Decrease, value: x.tpCost});

                if (x.damage.type > 0) {
                    effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }
                //emittor.effectSet.targetEffectIds.push(effect.id);
                emittor.effectSuite.addTargetEffect(new DEffectRef(effect.id));

                skill.name = x.name;
                skill.emittorId = emittor.id;
                skill.rmmzEffectScope = x.scope ?? DRmmzEffectScope.None;
                
                const messages = [];
                if (x.message1) messages.push(x.message1);
                if (x.message2) messages.push(x.message2);
                const flavorEffect = new DFlavorEffect();
                flavorEffect.text = messages;

                emittor.setupFromRmmzScope(x.scope ?? DRmmzEffectScope.None);
            }
        });

        // Actions
        MRBasics.actions = {
            DirectionChangeActionId: MRData.newSkillAsActivity("kAction_DirectionChange", "DirectionChange").id,
            MoveToAdjacentActionId: MRData.getSkill("kSkill_System_Move").id,
            PickActionId: MRData.newSkillAsActivity("kAction_Pick", "拾う").id,
            PutActionId: MRData.newSkillAsActivity("kAction_Put", "置く").id,
            ExchangeActionId: MRData.newSkillAsActivity("kAction_Exchange", "交換").id,
            ThrowActionId: MRData.newSkillAsActivity("kAction_Throw", "投げる").id,
            FlungActionId: MRData.newSkillAsActivity("kAction_Flung", "Flung").id,
            ShootActionId: MRData.newSkillAsActivity("kAction_Shoot", "撃つ", 1000).id,
            AffectActionId: MRData.newSkillAsActivity("kAction_Affect", "Affect").id,
            RollActionId: MRData.newSkillAsActivity("kAction_Roll", "Roll").id,
            FallActionId: MRData.newSkillAsActivity("kAction_Fall", "Fall").id,
            DropActionId: MRData.newSkillAsActivity("kAction_Drop", "Drop").id,
            trample: MRData.newSkillAsActivity("kAction_Trample", "踏む").id,
            TrashActionId: MRData.newSkillAsActivity("kAction_Trash", "Trash").id,
            ForwardFloorActionId: MRData.newSkillAsActivity("kAction_ForwardFloor", "すすむ").id,
            BackwardFloorActionId: MRData.newSkillAsActivity("kAction_BackwardFloor", "戻る").id,
            EquipActionId: MRData.newSkillAsActivity("kAction_Equip", "装備", 1000).id,
            EquipOffActionId: MRData.newSkillAsActivity("kAction_EquipOff", "はずす").id,
            EatActionId: MRData.newSkillAsActivity("kAction_Eat", "食べる", 1000).id,
            TakeActionId: MRData.newSkillAsActivity("kAction_Take", "Take").id,
            BiteActionId: MRData.newSkillAsActivity("kAction_Bite", "Bite").id,
            ReadActionId: MRData.newSkillAsActivity("kAction_Read", "読む", 1000).id,
            WaveActionId: MRData.newSkillAsActivity("kAction_Wave", "振る", 1000).id,
            PushActionId: MRData.newSkillAsActivity("kAction_Push", "Push").id,
            PutInActionId: MRData.newSkillAsActivity("kAction_PutIn", "PickIn").id,
            PickOutActionId: MRData.newSkillAsActivity("kAction_PickOut", "PickOut").id,
            IdentifyActionId: MRData.newSkillAsActivity("kAction_Identify", "Identify").id,
            talk: MRData.newSkillAsActivity("kAction_Talk", "talk").id,
            collide: MRData.newSkillAsActivity("kAction_Collide", "collide").id,
            dialogResult: MRData.newSkillAsActivity("kAction_DialogResult", "dialogResult").id,
            stumble: MRData.newSkillAsActivity("kAction_Stumble", "stumble").id,
            dead: MRData.newSkillAsActivity("kAction_Dead", "dead").id,
            performSkill: MRData.newSkillAsActivity("kAction_PerformSkill", "PerformSkill").id,
            AttackActionId: MRData.getSkill("kSkill_System_NormalAttack").id,
        };

        
        // Import Item
        MRData.items = [];
        MRData.itemDataIdOffset = MRData.items.length;
        $dataItems.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                item.rmmzItemId = x.id;

                const meta = DMetadataParser.parse(x.meta);
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.entityTemplateKey = meta.entityTemplateKey;
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);

                const emittor = MRData.newEmittor(meta.emittorKey ?? entity.entity.key);
                const effect = MRData.newEffect(meta.effectKey ?? entity.entity.key);
                effect.critical = false;
                effect.successRate = x.successRate;
                effect.hitType = x.hitType;
                if (x.animationId < 0) {
                    effect.flavorEffect = undefined;
                }
                else if (x.animationId === 0) {
                    effect.flavorEffect = null;
                }
                else {
                    effect.flavorEffect = DFlavorEffect.fromRmmzAnimationId(x.animationId);
                }
                effect.rmmzSpecialEffectQualifyings = x.effects;

                if (x.damage.type > 0) {
                    effect.parameterQualifyings.push(this.makeParameterQualifying(x.damage));
                }

                //effect.rmmzItemEffectQualifying = x.effects.
               // emittor.effectSet.targetEffectIds.push( effect.id);
               emittor.effectSuite.addTargetEffect(new DEffectRef(effect.id));

                entity.setMainEmittor(emittor);
                emittor.setupFromRmmzScope(x.scope ?? DRmmzEffectScope.None);
            }
        });
        MRData.weaponDataIdOffset = MRData.items.length;
        $dataWeapons.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                item.rmmzWeaponId = x.id;

                const meta = DMetadataParser.parse(x.meta);
                entity.display.name = DHelpers.parseDisplayName(x.name);
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);
                entity.equipment = new DEquipment();
                entity.equipment.equipmentPart = x.etypeId;
                entity.equipment.parameters[MRBasics.params.hp] = { value: x.params[0], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.mp] = { value: x.params[1], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.atk] = { value: x.params[2], upgradeRate: 1.0 };
                entity.equipment.parameters[MRBasics.params.def] = { value: x.params[3], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.mat] = { value: x.params[4], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.mdf] = { value: x.params[5], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.agi] = { value: x.params[6], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.luk] = { value: x.params[7], upgradeRate: 0 };
                entity.equipment.targetRmmzAnimationId =  x.animationId ?? 0;
                entity.equipmentTraits = x.traits.slice();
                entity.equipmentTraits = entity.equipmentTraits.concat(DTrait.parseTraitMetadata(x.meta));
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.entityTemplateKey = meta.entityTemplateKey;
            }
        });
        MRData.armorDataIdOffset = MRData.items.length;
        $dataArmors.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                item.rmmzArmorId = x.id;

                const meta = DMetadataParser.parse(x.meta);
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);
                entity.equipment = new DEquipment();
                entity.equipment.equipmentPart = x.etypeId;
                entity.equipment.parameters[MRBasics.params.hp] = { value: x.params[0], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.mp] = { value: x.params[1], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.atk] = { value: x.params[2], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.def] = { value: x.params[3], upgradeRate: 1.0 };
                entity.equipment.parameters[MRBasics.params.mat] = { value: x.params[4], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.mdf] = { value: x.params[5], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.agi] = { value: x.params[6], upgradeRate: 0 };
                entity.equipment.parameters[MRBasics.params.luk] = { value: x.params[7], upgradeRate: 0 };
                entity.equipmentTraits = x.traits.slice();
                entity.equipmentTraits = entity.equipmentTraits.concat(DTrait.parseTraitMetadata(x.meta));
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.entityTemplateKey = meta.entityTemplateKey;
            }
        });
        MRSystem.items = {
            autoSupplyFood: 2,
        };
        MRData.system.initialPartyMembers = [];
        for (const actorId of $dataSystem.partyMembers) {
            const entity = MRData.entities.find(x => x.actor && x.actor.rmmzActorId == actorId);
            assert(entity);
            MRData.system.initialPartyMembers.push(entity.id);
        }

        // Import Enemies
        $dataEnemies.forEach(x => {
            const [entity, enemy] = MRData.newEnemy();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = 71;
                enemy.exp = x.exp;
                if (x.params) {
                    //enemy.idealParams = x.params;
                    
                    entity.idealParams[MRBasics.params.hp] = x.params[0];
                    entity.idealParams[MRBasics.params.mp] = x.params[1];
                    entity.idealParams[MRBasics.params.atk] = x.params[2];
                    entity.idealParams[MRBasics.params.def] = x.params[3];
                    entity.idealParams[MRBasics.params.mat] = x.params[4];
                    entity.idealParams[MRBasics.params.mdf] = x.params[5];
                    entity.idealParams[MRBasics.params.agi] = x.params[6];
                    entity.idealParams[MRBasics.params.luk] = x.params[7];
                    
                }
                enemy.traits = x.traits;
                enemy.actions = x.actions;
                enemy.dropItems = DDropItem.makeFromRmmzDropItemList(x.dropItems, x.gold);
                entity.entity = parseMetaToEntityProperties(x.meta);    // TODO: ↓DMetadataParserを使う
                entity.entity.kindId = MRBasics.entityCategories.MonsterKindId;
                entity.factionId = MRData.system.factions.enemy;
                entity.classId =  MRBasics.defaultEnemyClass;

                enemy.traits = enemy.traits.concat(DTrait.parseTraitMetadata(x.meta));

                const meta = DMetadataParser.parse(x.meta);
                entity.raceIds = meta.races.map(x => MRData.getRace(x).id);

                MRSetup.setupEnemy(entity);
            }
        });

        // Import Troop
        MRData.troops = [];
        for (const x of $dataTroops) {
            const troop = new DTroop(MRData.troops.length);
            MRData.troops.push(troop);
            if (x) {
                const metadata = DAnnotationReader.readTroopAnnotationFromPage(x.pages[0]);
                if (metadata) {
                    troop.key = metadata.key;
                    troop.members = [];
                    for (const m of x.members) {
                        const entityId = MRData.enemies[m.enemyId];
                        const entity = MRData.entities[entityId];
                        if (!entity.isValidKey) {
                            throw new Error(tr2("%1 には、 MR-Key が設定されていない %2 が含まれています。").format(
                                DValidationHelper.makeRmmzTroopName(troop.id),
                                DValidationHelper.makeRmmzEnemyName(m.enemyId),
                            ));
                        }
                        troop.members.push(entityId);
                    }
                }
            }
        }

        // Link
        {
            MRData.system.link(this.testMode);

            for (const state of MRData.states) {
                for (const key of state.stateGroupKeys) {
                    const id = MRData.stateGroups.findIndex(x => x.key == key);
                    if (id > 0) {
                        state.stateGroupIds.push(id);
                    }
                    else {
                        throw new Error(`StateGroup not found. ${key}`);
                    }
                }
            }
        }

        next();
    }

    private static importTerrainSettings(next: NextFunc) {
        // 依存関係があるので、
        this.loadTextFile("mr/TerrainSettings.js", (obj) => {
            new DTerrainSettingImporter(obj);
            next();
        });
    }

    private static importFloorPreset(next: NextFunc) {
        this.loadTextFile("mr/FloorPresets.js", (obj) => {
            new DFloorPresetImporter(obj);
            next();
        });
    }

    private static importLandAndFloors(next: NextFunc) {
        // 最初に Land のインスタンスを作っておく
        {
            MRData.lands = [];
            MRData.lands.push(new DLand(0, false)); // [0] dummy

            const defaltLand = new DLand(1, false);
            MRData.lands.push(defaltLand);  // [1] REシステム管理外の RMMZ マップを表す Land

            // const worldLand = new DLand(2);
            // MRData.lands.push(worldLand);   // [2] World
            
            {
                const level = DLandIdentificationLevel.Entity;
                for (const kind of MRData.categories) {
                    defaltLand.identifiedKinds[kind.id] = level;
                }
            }

            for (var i = 0; i < $dataMapInfos.length; i++) {
                const info = $dataMapInfos[i];
                if (info && this.isLandMap(i)) {
                    const land = new DLand(MRData.lands.length, info.name.startsWith("MR-World:"));
                    land.name = info.name;
                    land.rmmzMapId = i;
                    MRData.lands.push(land);
                }
            }
        }

        // Floor 情報を作る
        // ※フロア数を Land マップの width としているが、これは MapInfo から読み取ることはできず、
        //   全マップを一度ロードする必要がある。しかしそうすると処理時間が大きくなってしまう。
        //   ひとまず欠番は多くなるが、最大フロア数でデータを作ってみる。
        {
            // 固定マップ
            for (let i = 1; i < $dataMapInfos.length; i++) {
                const info = $dataMapInfos[i];
                const mapData = MRData.newMap();
                if (!info) continue;    // RMMZ のマップは歯抜けになることがある。その場合は採番のため DMap は作っておくが、関連付けは行わない。

                const nodeInfo = DDataImporter.getMapDataNodeInfo(i);

                // Map が属する Land を求めておく
                let land = MRData.lands[DHelpers.VanillaLandId];
                if (nodeInfo.landRmmzMapId !== undefined && nodeInfo.landRmmzMapId > 0) {
                    const r = MRData.lands.find(x => x.rmmzMapId == nodeInfo.landRmmzMapId);
                    if (r) {
                        land = r;
                    }
                }
                
                mapData.landId = land.id;
                mapData.mapId = i;
                assert(mapData.id == i);

                if (info.name?.startsWith("MR-Safety:")) {
                    mapData.safetyMap = true;
                }

                if (this.isDatabaseMap(i)) {
                    this.databaseMapId = i;
                }
                else if (nodeInfo.rootType == DMapDataNodeRootType.MapTemplates && nodeInfo.leafType != DMapDataNodeLeafType.RootOrDirctory) {
                    mapData.mapKind = REFloorMapKind.TemplateMap;
                    const templateMap = MRData.newTemplateMap();
                    templateMap.name = info.name;
                    templateMap.mapId = mapData.id;
                }
                else if (info.name?.startsWith("MR-Land:") || info.name?.startsWith("MR-World:")) {
                    const land = MRData.lands.find(x => x.rmmzMapId == i);
                    assert(land);
                    mapData.mapKind = REFloorMapKind.Land;
                }
                else if (nodeInfo.rootType == DMapDataNodeRootType.LandLike) {
                    if (nodeInfo.directory === DLandMapDataDirectory.Shuffle && nodeInfo.leafType != DMapDataNodeLeafType.RootOrDirctory) {
                        mapData.mapKind = REFloorMapKind.ShuffleMap;
                    }
                    else if (nodeInfo.directory === DLandMapDataDirectory.Fixed && nodeInfo.leafType != DMapDataNodeLeafType.RootOrDirctory) {
                        mapData.mapKind = REFloorMapKind.FixedMap;
                        land.fixedMapIds.push(mapData.id);
                    }
                }

                DDataImporter.linkMapData(mapData, info, nodeInfo, land);

                // VanillaLand は特別扱い。FloorNumber と RmmzMapId が一致するようにする。
                if (land.id == DHelpers.VanillaLandId) {
                    land.fixedMapIds.push(mapData.id);
                    land.eventMapIds.push(mapData.id);
                    land.floorInfos[mapData.mapId] = {
                        key: "",
                        template: undefined,
                        displayName: undefined,
                        mode: DFloorMode.Area,
                        floorClass: DFloorClass.EventMap,
                        fixedMapIndex: land.fixedMapIds.length - 1,
                        eventMapIndex: land.eventMapIds.length - 1,
                        safetyActions: true,
                        bgmName: "",
                        bgmVolume: 90,
                        bgmPitch: 100,
                        presetId: 0,
                        unique: false,
                        fovSystem: DFovSystem.RoomBounds,
                    };
                }
            }
        }

        
        // 検証
        for (const land of MRData.lands) {
        }

        next();
    }

    private static importPseudonymous(next: NextFunc) : void{
        this.loadDataFile("mr/Pseudonymous.json", (obj) => {
            MRData.pseudonymous.setup(obj);
            next();
        });
    }

    private static importPrefabs(next: NextFunc): void {
        assert(this.databaseMapId > 0);
        this.beginLoadMapData(this.databaseMapId, (obj: any) => { 
            const mapData: IDataMap = obj;
            for (const event of mapData.events) {
                if (!event) continue;
                const data = DAnnotationReader.readPrefabAnnotation(event, this.databaseMapId);
                if (!data) continue;

                const prefab =  MRData.newPrefab(event.name);
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
                    prefab.stateImages = data.stateImages.map(x => { return { stateId: MRData.getState(x[0]).id, characterName: x[1], characterIndex: x[2]}; });
                }
                if (event.pages[0].moveType == 3) { // TODO: 仮
                    prefab.moveType = DPrefabMoveType.Fix;
                }

                MRData.prefabs.push(prefab);

                // SubPages
                for (let i = 1; i < event.pages.length; i++) {
                    const page = event.pages[i];
                    const pageData = DAnnotationReader.readPrefabSubPageAnnotation(page);
                    if (pageData) {
                        if (pageData.state === undefined) throw new Error(`@MR-PrefabSubPage requires state field.`);
                        prefab.subPages.push({ stateId: MRData.getState(pageData.state).id, rmmzEventPageIndex: i });
                    }
                }

                // Scripts
                for (let i = 0; i < event.pages.length; i++) {
                    const page = event.pages[i];
                    const script = new DScript(page.list);
                    prefab.scripts.push(script);
                }
            }

            // Link Prefab and Entity
            {
                for (const entity of MRData.entities) {
                    if (entity.entity.key != "") {
                        if (entity.entity.meta_prefabName) {
                            const prefab = MRData.prefabs.find(x => x.key == entity.entity.meta_prefabName);
                            if (prefab && prefab.id > 0) {
                                entity.prefabId = prefab.id;
                                MRSetup.setupPrefab(prefab);
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

            MRBasics.prefabs = {
                illusionActor: MRData.getPrefab("pまどわしUnit").id,
                illusionItem: MRData.getPrefab("pまどわしItem").id,
            };

            next();
        });
    }

    private static importLandDatabase(next: NextFunc): void {
        const validLands = MRData.lands.filter(x => x.rmmzMapId > 0);
        for (let iLand = 0; iLand < validLands.length; iLand++) {
            const land = validLands[iLand];
            MRDataManager.beginLoadMapData(land.rmmzMapId, (data: any) => { 
                land.import(data);
                
                if (land.enemyTableMapId > 0) MRDataManager.beginLoadMapData(land.enemyTableMapId, (data: any) => {
                    DLand.buildSubAppearanceTable(land, data, land.enemyTableMapId, land.appearanceTable, land.appearanceTable.enemies);
                });
                if (land.itemTableMapId > 0) MRDataManager.beginLoadMapData(land.itemTableMapId, (data: any) => {
                    DLand.buildSubAppearanceTable(land, data, land.itemTableMapId, land.appearanceTable, land.appearanceTable.items);
                });
                if (land.trapTableMapId > 0) MRDataManager.beginLoadMapData(land.trapTableMapId, (data: any) => {
                    DLand.buildSubAppearanceTable(land, data, land.trapTableMapId, land.appearanceTable, land.appearanceTable.traps);
                });
                if (land.shopTableMapId > 0) MRDataManager.beginLoadMapData(land.shopTableMapId, (data: any) => {
                    DLand.buildSubAppearanceTable(land, data, land.shopTableMapId, land.appearanceTable, land.appearanceTable.shop);
                });

                if (iLand == validLands.length - 1) {
                    next();
                }
            });
        }
    }

    private static importTemplateMaps(next: NextFunc): void {
        const validMaps = MRData.templateMaps.filter(x => x.mapId > 0);
        for (let iMap = 0; iMap < validMaps.length; iMap++) {
            const templateMap = validMaps[iMap];
            this.beginLoadMapData(templateMap.mapId, (obj: any) => { 
                templateMap.import(obj);

                if (iMap == validMaps.length - 1) {
                    next();
                }
            });
        }
    }

    public static importSetupScript(next: NextFunc): void {
        const scripts = [
            "mr/EntityCategories.js",
            "mr/EntityTemplates.js",
            "mr/Setup.js",
            "mr/Actions.js",
            "mr/Parameters.js",
            "mr/Effects.js",
            "mr/Emittors.js",
            "mr/Entities.js",
        ];
        const scriptDB = new DSetupScript();

        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            this.loadTextFile(script, (obj) => {
                scriptDB.addScript(obj);
                if (i == scripts.length - 1) {
                    scriptDB.registerData();
                    scriptDB.setupData();

                    
                    for (const state of MRData.states) {
                        MRSetup.setupDirectly_State(state);
                    }

                    // SystemState 等を参照したいので、System の Link の後で。
                    for (const skill of MRData.skills) {
                        MRSetup.setupDirectly_Skill(skill)
                    }
                    MRData.skills.forEach(x => MRSetup.linkSkill(x));


                    for (const item of MRData.items) {
                        MRSetup.setupDirectly_DItem(MRData.entities[item]);
                    }

                    for (const id of MRData.actors) {
                        if (id > 0) MRSetup.setupActor(MRData.entities[id]);
                    }

                    // Skill を参照するので、Skill の Link の後で。
                    for (const id of MRData.items) {
                        MRSetup.linkItem(MRData.entities[id]);
                    }
                    
                    for (const item of MRData.items) {
                        scriptDB.setupItem(MRData.entities[item]);
                    }

                    next();
                }
            });
        }
    }

    private static notifyDatabaseReady(next: NextFunc): void {
        MRData.ext?.onDatabaseLoaded();
        next();
    }
    
    private static beginLoadMapData(rmmzMapId: number, onLoad: (obj: any) => void) {
        const filename = `Map${this.padZero(rmmzMapId, 3)}.json`;
        this.loadDataFile(filename, onLoad);
    }

    private static padZero(v: number, length: number) {
        return String(v).padStart(length, "0");
    }

    private static makeParameterQualifying(damage: IDataDamage): DParameterQualifying {
        let parameterId = 0;
        let applyType = DParameterEffectApplyType.None;
        switch (damage.type) {
            case 1: // HPダメージ
                parameterId = MRBasics.params.hp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 2: // MPダメージ
                parameterId = MRBasics.params.mp;
                applyType = DParameterEffectApplyType.Damage;
                break;
            case 3: // HP回復
                parameterId = MRBasics.params.hp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 4: // MP回復
                parameterId = MRBasics.params.mp;
                applyType = DParameterEffectApplyType.Recover;
                break;
            case 5: // HP吸収
                parameterId = MRBasics.params.hp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            case 6: // MP吸収
                parameterId = MRBasics.params.mp;
                applyType = DParameterEffectApplyType.Drain;
                break;
            default:
                throw new Error();
        }
        const param = new DParameterQualifying(parameterId, damage.formula ?? "0", applyType);
        param.elementIds[0] = damage.elementId ?? 0;
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

    private static isDatabaseMap(mapId: DMapId) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && info.name.startsWith("MR-Prefabs"))
            return true;
        else
            return false;
    }

    public static isLandMap(mapId: DMapId) : boolean {
        const info = $dataMapInfos[mapId];
        if (info && info.name && (info.name.startsWith("MR-Land:") || info.name.startsWith("MR-World:")))
            return true;
        else
            return false;
    }

    public static isRESystemMap(mapId: DMapId) : boolean {
        const map = MRData.maps[mapId];
        if (map.eventMap) return false;
        return map.landId > DHelpers.VanillaLandId;
    }

    //--------------------------------------------------
    // DataManager の実装
    //   コアスクリプトの DataManager は結果をグローバル変数へ格納するが、
    //   代わりにコールバックで受け取るようにしたもの。
    //   また UnitTest 環境では同期的にロードしたいので、必要に応じて FS を使うようにしている。
   
    private static _loadingDataFileCount = 0;
    private static _loadedDataFileCount = 0;

    private static loadDataFile(src: string, onLoad: (obj: any) => void) {
        if (DHelpers.isNode()) {
            const dataDir = "data/";
            const data = JSON.parse(fs.readFileSync(dataDir + src).toString());
            onLoad(data);
        }
        else {
            this._loadingDataFileCount++;
            const xhr = new XMLHttpRequest();
            const url = "data/" + src;
            xhr.open("GET", url);
            xhr.overrideMimeType("application/json");
            xhr.onload = () => this.onXhrLoad(xhr, src, url, (obj) => { onLoad(obj); this._loadedDataFileCount++; });
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

    private static onXhrLoad(xhr: XMLHttpRequest, src: string, url: string, onLoad: (obj: any) => void) {
        if (xhr.status < 400) {
            onLoad(JSON.parse(xhr.responseText));
        } else {
            DataManager.onXhrError(src, src, url);
        }
    }
}
