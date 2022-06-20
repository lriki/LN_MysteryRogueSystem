import fs from 'fs';
import { RESystem } from "ts/mr/system/RESystem";
import { assert, tr, tr2 } from "../Common";
import { DMap, MRData, REFloorMapKind } from "./MRData";
import { MRBasics } from "./MRBasics";
import { DState, DStateRestriction } from "./DState";
import { DEquipmentType_Default } from "./DEquipmentType";
import { DAbility, DAbility_Default } from "./DAbility";
import { parseMetaToEntityProperties } from "./DEntityProperties";
import { DLand, DLandIdentificationLevel, DMapId } from "./DLand";
import { DHelpers } from "./DHelper";
import { DPrefabMoveType } from "./DPrefab";
import { DActor } from './DActor';
import { DEquipment } from './DItem';
import { DTrait } from './DTraits';
import { DRmmzEffectScope, DParameterEffectApplyType, DParameterQualifying, DEffectFieldScopeRange, DSkillCostSource, DParamCostType, DEffect } from './DEffect';
import { DSystem } from './DSystem';
import { DSkill } from './DSkill';
import { DTroop } from './DTroop';
import { DStateGroup } from './DStateGroup';
import { MRSetup } from './MRSetup';
import { DAttackElement } from './DAttackElement';
import { DParamMessageValueSource, REData_Parameter } from './DParameter';
import { DDataImporter } from './DDataImporter';
import { DDropItem } from './DEnemy';
import { DTextManager } from './DTextManager';
import { DAnnotationReader } from './DAttributeReader';
import { DMetadataParser } from './DMetadataParser';
import { DSetupScript } from './DSetupScript';
import { DSectorConnectionPreset, FGenericRandomMapWayConnectionMode } from './DTerrainPreset';
import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from '../PluginParameters';
import { DTerrainSettingImporter } from './importers/DTerrainSettingImporter';
import { DFloorPresetImporter } from './importers/DFloorPresetImporter';

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
            upgradeValue: MRData.parameters.findIndex(x => x.code == "up"),
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
        MRData.parameters[MRBasics.params.exp].initialValue = 0;
        MRData.parameters[MRBasics.params.level].selfGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].selfLossMessage = DTextManager.actorLoss;
        MRData.parameters[MRBasics.params.level].targetGainMessage = DTextManager.levelUp;
        //REData.parameters[REBasics.params.level].targetLossMessage = DTextManager.enemyLoss;
        MRData.parameters[MRBasics.params.level].messageValueSource = DParamMessageValueSource.Absolute;
        
        
        MRBasics.entityKinds = {
            actor: MRData.addEntityKind("Actor", "Actor"),
            WeaponKindId: MRData.addEntityKind("武器", "Weapon"),
            ShieldKindId: MRData.addEntityKind("盾", "Shield"),
            ArrowKindId: MRData.addEntityKind("矢", "Arrow"),
            //RE_Data.addEntityKind("石"),
            //RE_Data.addEntityKind("弾"),
            BraceletKindId: MRData.addEntityKind("腕輪", "Ring"),
            FoodKindId: MRData.addEntityKind("食料", "Food"),
            grass: MRData.addEntityKind("草", "Grass"),
            ScrollKindId: MRData.addEntityKind("巻物", "Scroll"),
            WandKindId: MRData.addEntityKind("杖", "Staff"),
            PotKindId: MRData.addEntityKind("壺", "Pot"),
            DiscountTicketKindId: MRData.addEntityKind("割引券", "DiscountTicket"),
            BuildingMaterialKindId: MRData.addEntityKind("材料", "BuildingMaterial"),
            TrapKindId: MRData.addEntityKind("罠", "Trap"),
            FigurineKindId: MRData.addEntityKind("土偶", "Figurine"),
            MonsterKindId: MRData.addEntityKind("モンスター", "Monster"),
            entryPoint: MRData.addEntityKind("入り口", "EntryPoint"),
            exitPoint: MRData.addEntityKind("出口", "ExitPoint"),
            Ornament: MRData.addEntityKind("Ornament", "Ornament"),
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

        // Actions
        MRBasics.actions = {
            DirectionChangeActionId: MRData.newAction("DirectionChange").id,
            MoveToAdjacentActionId: MRData.newAction("MoveToAdjacent").id,
            PickActionId: MRData.newAction("拾う").id,
            PutActionId: MRData.newAction("置く").id,
            ExchangeActionId: MRData.newAction("交換").id,
            ThrowActionId: MRData.newAction("投げる").id,
            FlungActionId: MRData.newAction("Flung").id,
            ShootingActionId: MRData.newAction("撃つ", 1000).id,
            AffectActionId: MRData.newAction("Affect").id,
            RollActionId: MRData.newAction("Roll").id,
            FallActionId: MRData.newAction("Fall").id,
            DropActionId: MRData.newAction("Drop").id,
            trample: MRData.newAction("trample").id,
            TrashActionId: MRData.newAction("Trash").id,
            ForwardFloorActionId: MRData.newAction("すすむ").id,
            BackwardFloorActionId: MRData.newAction("戻る").id,
            EquipActionId: MRData.newAction("装備", 1000).id,
            EquipOffActionId: MRData.newAction("はずす").id,
            EatActionId: MRData.newAction("食べる", 1000).id,
            TakeActionId: MRData.newAction("Take").id,
            BiteActionId: MRData.newAction("Bite").id,
            ReadActionId: MRData.newAction("読む", 1000).id,
            WaveActionId: MRData.newAction("振る", 1000).id,
            PushActionId: MRData.newAction("Push").id,
            PutInActionId: MRData.newAction("PickIn").id,
            PickOutActionId: MRData.newAction("PickOut").id,
            IdentifyActionId: MRData.newAction("Identify").id,
            talk: MRData.newAction("talk").id,
            collide: MRData.newAction("collide").id,
            dialogResult: MRData.newAction("dialogResult").id,
            stumble: MRData.newAction("stumble").id,
            dead: MRData.newAction("dead").id,
            performSkill: MRData.newAction("PerformSkill").id,
            AttackActionId: MRData.newAction("Attack").id,
        };

        MRBasics.commands = {
            testPickOutItem: MRData.newCommand("testPickOutItem").id,
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
        
        RESystem.skills = {
            move: 3,
            normalAttack: 1,
        };

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
            warp: MRData.newEffectBehavior("Warp").id,
            stumble: MRData.newEffectBehavior("Stumble").id,
            transferToNextFloor: MRData.newEffectBehavior("TransferToNextFloor").id,
            transferToLowerFloor: MRData.newEffectBehavior("TransferToLowerFloor").id,
            trapProliferation: MRData.newEffectBehavior("TrapProliferation").id,
            dispelEquipments: MRData.newEffectBehavior("DispelEquipments").id,
            changeInstance: MRData.newEffectBehavior("ChangeInstance").id,
            restartFloor: MRData.newEffectBehavior("RestartFloor").id,
            clarification: MRData.newEffectBehavior("Clarification").id,
            division: MRData.newEffectBehavior("Division").id,
            removeStatesByIntentions: MRData.newEffectBehavior("RemoveStatesByIntentions").id,
            performeSkill: MRData.newEffectBehavior("PerformeSkill").id,
        };

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

        next();
    }

    private static loadData(next: NextFunc): void {
        MRData.system = new DSystem();

        // Import AttackElements
        MRData.attackElements = [];
        for (const x of $dataSystem.elements) {
            const e = new DAttackElement(MRData.attackElements.length);
            MRData.attackElements.push(e);
            if (x) {
                e.parseNameAndKey(x);
            }
        }

        MRBasics.variables = {
            result: $dataSystem.variables.findIndex(x => x == "MR-CommndResult1"),
            landExitResult: $dataSystem.variables.findIndex(x => x == "MR-ExitResult"),
            landExitResultDetail: $dataSystem.variables.findIndex(x => x == "MR-ExitResultDetail"),
        };

        MRBasics.elements = {
            explosion: MRData.getAttackElement("kElement_Explosion").id,
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
                        //state.effect.traits = x.traits.concat(DTrait.parseTraitMetadata(x.meta));
                        //state.effect.behaviors = makeStateBehaviorsFromMeta(x.meta);
                        state.import(x);
                    }
                }
            }
            for (const state of MRData.states) {
                MRSetup.setupDirectly_State(state);
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
        MRData.skills = [];
        $dataSkills.forEach(x => {
            const skill = new DSkill(MRData.skills.length);
            MRData.skills.push(skill);
            if (x) {
                skill.parseMetadata(x.meta);

                const emittor = MRData.newEmittor(skill.key);
                const effect = new DEffect(skill.key);
                effect.critical = false;
                effect.successRate = x.successRate;
                effect.hitType = x.hitType;
                effect.rmmzAnimationId = x.animationId;
                effect.rmmzSpecialEffectQualifyings = x.effects;

                emittor.costs.setParamCost(DSkillCostSource.Actor, MRBasics.params.mp, {type: DParamCostType.Decrease, value: x.mpCost});
                emittor.costs.setParamCost(DSkillCostSource.Actor, MRBasics.params.tp, {type: DParamCostType.Decrease, value: x.tpCost});

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
        MRData.items = [];
        MRData.itemDataIdOffset = MRData.items.length;
        $dataItems.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                entity.entity = parseMetaToEntityProperties(x.meta);
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
                entity.description = x.description;
                entity.sellingPrice2 = x.price;
                entity.purchasePrice = Math.max(entity.sellingPrice2 / 2, 1);

                const emittor = MRData.newEmittor(entity.entity.key);
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
        MRData.weaponDataIdOffset = MRData.items.length;
        $dataWeapons.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                entity.display.name = DHelpers.parseDisplayName(x.name);
                entity.display.iconIndex = x.iconIndex ?? 0;
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
        MRData.armorDataIdOffset = MRData.items.length;
        $dataArmors.forEach(x => {
            const [entity, item] = MRData.newItem();
            if (x) {
                entity.display.name = x.name;
                entity.display.iconIndex = x.iconIndex ?? 0;
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
            }
        });
        RESystem.items = {
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
                entity.entity.kindId = MRBasics.entityKinds.MonsterKindId;
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
                troop.key = x.name;
                troop.members = x.members.map(m => MRData.enemies[m.enemyId]);
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
        // Import Lands
        // 最初に Land を作る
        MRData.lands = [];
        MRData.lands.push(new DLand(0)); // [0] dummy

        
        const defaltLand = new DLand(1);
        MRData.lands.push(defaltLand); // [1] REシステム管理外の RMMZ マップを表す Land
        
        {
            const level = DLandIdentificationLevel.Entity;
            for (const kind of MRData.entityKinds) {
                defaltLand.identifiedKinds[kind.id] = level;
            }
        }

        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("MR-Land:")) {
                const land = new DLand(MRData.lands.length);
                land.name = info.name;
                land.rmmzMapId = i;
                MRData.lands.push(land);
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
                
                const mapData = MRData.newMap();
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
                            const templateMap = MRData.newTemplateMap();
                            templateMap.name = info.name;
                            templateMap.mapId = mapData.id;
                        }
                        else if (info.name?.startsWith("MR-Land:")) {
                            const land = MRData.lands.find(x => x.rmmzMapId == i);
                            assert(land);
                            mapData.landId = land.id;
                            mapData.mapKind = REFloorMapKind.Land;
                        }
                        else if (info.parentId) {
                            const land = MRData.lands.find(x => parentInfo && parentInfo.parentId && x.rmmzMapId == parentInfo.parentId);
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
                    MRData.lands[DHelpers.RmmzNormalMapLandId].floorInfos[mapData.mapId] = {
                        key: "",
                        template: undefined,
                        displayName: undefined,
                        fixedMapName: "", safetyActions: true, bgmName: "", bgmVolume: 90, bgmPitch: 100,
                        presetId: 0,
                    };
                }
            }
        }

        // 検証
        for (const land of MRData.lands) {
            if (land.id > 0 && land.id != DHelpers.RmmzNormalMapLandId) {
                if (land.exitRMMZMapId == 0) {
                    throw new Error(`Land[${land.name}] is MR-ExitMap not defined.`);
                }
            }
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
                const data = DAnnotationReader.readPrefabMetadata(event, this.databaseMapId);
                if (!data) continue;

                const prefab =  MRData.newPrefab();
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
                    prefab.stateImages = data.stateImages.map(x => { return { stateId: MRData.getState(x[0]).id, characterName: x[1], characterIndex: x[2]}; });
                }
                if (event.pages[0].moveType == 3) { // TODO: 仮
                    prefab.moveType = DPrefabMoveType.Fix;
                }

                MRData.prefabs.push(prefab);

                for (let i = 1; i < event.pages.length; i++) {
                    const pageData = DAnnotationReader.readPrefabSubPageMetadata(event.pages[i]);
                    if (pageData) {
                        if (pageData.state === undefined) throw new Error(`@MR-PrefabSubPage requires state field.`);
                        prefab.subPages.push({ stateId: MRData.getState(pageData.state).id, rmmzEventPageIndex: i });
                    }
                }
            }

            // Link Prefab and Entity
            {
                for (const entity of MRData.entities) {
                    if (entity.entity.key != "") {
                        if (entity.entity.meta_prefabName) {
                            const prefab = MRData.prefabs.find(x => x.key == entity.entity.meta_prefabName);
                            if (prefab) {
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
        this.loadTextFile("mr/Setup.js", (obj) => {
            const scriptDB = new DSetupScript(obj);
            
            // SystemState 等を参照したいので、System の Link の後で。
            for (const skill of MRData.skills) {
                MRSetup.setupDirectly_Skill(skill)
            }
            MRData.skills.forEach(x => MRSetup.linkSkill(x));

            for (const item of MRData.items) {
                scriptDB.setupItem(MRData.entities[item]);
            }

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

            next();
        });
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
        if (info && info.name && info.name.startsWith("MR-Land:"))
            return true;
        else
            return false;
    }

    public static isRESystemMap(mapId: DMapId) : boolean {
        const map = MRData.maps[mapId];
        if (map.eventMap) return false;
        return map.landId > DHelpers.RmmzNormalMapLandId;
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
            const dataDir = "data/";//REData.testMode ? "../data/" : "data/";
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
