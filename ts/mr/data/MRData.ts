import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { DState } from "./DState";
import { DSystem } from "./DSystem";
import { DSkill } from "./DSkill";
import { DClass } from "./DClass";
import { DItem, DItemDataId } from "./DItem";
import { DLand } from "./DLand";
import { DEntityCategory } from "./DEntityCategory";
import { DSequel, DSequelId } from "./DSequel";
import { DEnemy, DEnemyId } from "./DEnemy";
import { DEquipmentPart } from "./DEquipmentPart";
import { DActor } from "./DActor";
import { DAbility } from "./DAbility";
import { DMonsterHouseType } from "./DMonsterHouse";
import { DTemplateMap } from "./DTemplateMap";
import { DPrefab } from "./DPrefab";
import { DTrait } from "./DTrait";
import { DParameter } from "./DParameter";
import { DEntity, DEntityId } from "./DEntity";
import { DTroop } from "./DTroop";
import { DStateGroup } from "./DStateGroup";
import { DPseudonymous } from "./DPseudonymous";
import { DItemShopType } from "./DItemShop";
import { MRDataExtension } from "./MRDataExtension";
import { DEmittor } from "./DEmittor";
import { DElement } from "./DElement";
import { assert } from "../Common";
import { DRace } from "./DRace";
import { DFloorPreset, DTerrainSetting, DTerrainShape } from "./DTerrainPreset";
import { DCommand } from "./DCommand";
import { DEffect } from "./DEffect";
import { DActionId, DEffectId, DEmittorId, DParameterId, DSkillId } from "./DCommon";
import { DMap } from "./DMap";
import { DEntityTemplate, IEntityTemplateProps } from "./DEntityTemplate";
import { DSpecialEffect } from "./DSpecialEffect";
import { DChronus } from "./DChronus";
import { DQuest } from "./DQuest";


export type DFactionId = number;

/**
 * 勢力
 */
export interface REData_Faction
{
    /** ID (0 is Invalid). */
    id: DFactionId;

    /** Name */
    name: string;

    /** 行動順 */
    schedulingOrder: number;

    hostileBits: number;
    friendBits: number;
}



// 2xx: 踏破
// 3xx: 中断。持ち物などは無くならない。
// 4xx: ゲームオーバー。
export enum LandExitResult {
    /** 冒険中 */
    Challenging = 100,

    /** ゴールに到達した。最後のフロアを抜けたか、戻り状態で最初のフロアを抜けたとき。 */
    Goal = 200,

    /** 脱出の巻物などによって冒険を中断した。 */
    Escape = 300,

    /** ゲームオーバーによって Land から出された。 */
    Gameover = 400,

    /** 冒険をあきらめた（メニューから） */
    Abandoned = 401,

    /** 制約付きのハードコアモードなど、ダンジョン内でセーブせずにゲームを終えたらゲームオーバー扱いする。 */
    InvalidSuspend = 402,
}

/** Database */
export class MRData
{
    static readonly MAX_DUNGEON_FLOORS = 100;
    static testMode = false;

    
    // Common defineds.
    static NormalAttackSkillId: number = 1;

    static ext: MRDataExtension = new MRDataExtension();

    static system: DSystem;
    static chronus: DChronus;

    static elements: DElement[] = [];
    static equipmentParts: DEquipmentPart[] = [];
    static categories: DEntityCategory[] = [];

    static classes: DClass[] = [];
    static races: DRace[] = [];
    static actors: DEntityId[] = [];
    static enemies: DEntityId[] = [];
    static lands: DLand[] = [];
    static maps: DMap[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
    static templateMaps: DTemplateMap[] = [];
    static factions: REData_Faction[] = [];
    //static actions: DAction[] = [];
    static commands: DCommand[] = [];
    static sequels: DSequel[] = [{id: 0, name: "null", parallel: false, fluidSequence: false}];
    static parameters: DParameter[] = [];
    static effectBehaviors: DSpecialEffect[] = [];
    // static presets: DPreset[] = [];
    static skills: DSkill[] = [];
    static items: DEntityId[] = [];
    static traits: DTrait[] = [];
    static states: DState[] = [];
    static stateGroups: DStateGroup[] = [];
    static abilities: DAbility[] = [];
    static monsterHouses: DMonsterHouseType[] = [];
    static itemShops: DItemShopType[] = [];
    static prefabs: DPrefab[] = [];
    static entities: DEntity[] = [];
    static entityTemplates: DEntityTemplate[] = [];
    static troops: DTroop[] = [];
    static emittors: DEmittor[] = [];
    static effects: DEffect[] = [];
    static terrainShapes: DTerrainShape[] = [];
    static terrainSettings: DTerrainSetting[] = [];
    static floorPresets: DFloorPreset[] = [];
    static pseudonymous: DPseudonymous = new DPseudonymous();
    static quests: DQuest[] = [];

    static itemDataIdOffset: number = 0;
    static weaponDataIdOffset: number = 0;
    static armorDataIdOffset: number = 0;
    //static rmmzWeaponTypeIdOffset: number = 0;
    //static rmmzArmorTypeIdOffset: number = 0;

    static _behaviorFactories: (() => LBehavior)[] = [];

    static reset() {
        this.chronus = new DChronus();

        this.categories = [new DEntityCategory(0, "null")];

        this.classes = [];
        this.newClass("null");
        this.races = [new DRace(0)];

        this.actors = [0];

        this.enemies = [];
        this.lands = [];
        this.maps = [new DMap(0)];
        this.templateMaps = [new DTemplateMap(0)];
        this.factions = [];
        //this.actions = [new DAction(0, "null")];
        this.commands = [new DCommand(0, "null")];
        this.sequels = [{id: 0, name: "null", parallel: false, fluidSequence: false}];
        this.parameters = [];

        this.effectBehaviors = [new DSpecialEffect(0, "null")];
        this.skills = [];
        this.items = [];

        this.states = [];
        this.prefabs = [new DPrefab(0, "null")];
        this.entities = [new DEntity(0)];
        this.entityTemplates = [new DEntityTemplate(0, "null", { type: "null" })];
        this.emittors = [new DEmittor(0, "null")];
        this.effects = [new DEffect(0, "null")];
        this.terrainSettings = [new DTerrainSetting(0)];
        this.floorPresets = [new DFloorPreset(0)];
        this.quests = [new DQuest(0, "null")];
    }

    //--------------------------------------------------------------------------

    static newElement(key: string): DElement {
        const data = new DElement(this.races.length, key);
        this.elements.push(data);
        return data;
    }

    static getElement(pattern: string): DElement {
        const d = this.elements.find(e => (e.key != "" && e.key == pattern));
        if (d) return d;
        throw new Error(`AttackElement "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newEntityCategory(key: string, displayName: string = ""): DEntityCategory {
        const data = new DEntityCategory(this.categories.length, key);
        data.displayName = displayName;
        this.categories.push(data);
        return data;
    }

    static findEntityCategory(pattern: string): DEntityCategory | undefined {
        return this.findHelper(this.categories, pattern, x => x.key === pattern);
    }

    static getEntityCategory(pattern: string): DEntityCategory {
        const d = this.findEntityCategory(pattern);
        if (!d) throw new Error(`EntityCategory "${pattern}" not found.`);
        return d;
    }
    
    //--------------------------------------------------------------------------
    
    static newClass(name: string): number {
        const newId = this.classes.length;
        const data = new DClass(newId);
        data.name = name;
        this.classes.push(data);
        return newId;
    }
    
    //--------------------------------------------------------------------------

    static newRace(): DRace {
        const data = new DRace(this.races.length);
        this.races.push(data);
        return data;
    }

    static findRace(pattern: string): DRace | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.races[id];
        else {
            return this.races.find(x => (x.key != "" && x.key == pattern) || x.name == pattern);
        }
    }

    static getRace(pattern: string): DRace {
        const d = this.findRace(pattern);
        if (d) return d;
        throw new Error(`Race "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newTemplateMap(): DTemplateMap {
        const newId = this.templateMaps.length;
        const data = new DTemplateMap(newId);
        this.templateMaps.push(data);
        return data;
    }

    //--------------------------------------------------------------------------
    // Actions
    
    // static newAction(key: string, displayName: string, priority?: number): DAction {
    //     const newData = new DAction(this.actions.length, key);
    //     newData.displayName = displayName;
    //     newData.priority = priority ?? 0;
    //     this.actions.push(newData);
    //     return newData;
    // }

    // static action(key: DActionId | string): DAction {
    //     let data;
    //     if (typeof key === "number") {
    //         data = this.actions[key];
    //     }
    //     else if (typeof key == 'string') {
    //         data = this.actions.find(x => x.displayName == key);
    //     }
    //     if (data) return data;
    //     throw new Error(`Action "${key}" not found.`);
    // }

    //--------------------------------------------------------------------------

    static newCommand(name: string): DCommand {
        const newId = this.commands.length;
        const newData = new DCommand(newId, name);
        this.commands.push(newData);
        return newData;
    }

    //--------------------------------------------------------------------------
    
    static addSequel(name: string): DSequelId {
        const newId = this.sequels.length;
        this.sequels.push({
            id: newId,
            name: name,
            parallel: false,
            fluidSequence: false,
        });
        return newId;
    }

    //--------------------------------------------------------------------------
    // Parameters
    static addParams(key: string, displayName: string): DParameter {
        const data = new DParameter(this.parameters.length, key, displayName);
        this.parameters.push(data);
        return data;
    }

    static getParameter(key: DParameterId | string): DParameter {
        let data;
        if (typeof key === "number") {
            data = this.parameters[key];
        }
        else if (typeof key == 'string') {
            data = this.parameters.find(x => x.key == key);
        }
        if (data) return data;
        throw new Error(`Parameter "${key}" not found.`);
    }


    //--------------------------------------------------------------------------
    // 

    static newEntity(): DEntity {
        const data = new DEntity(this.entities.length);
        this.entities.push(data);
        return data;
    }

    static findEntity(pattern: string): DEntity | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.entities[id];
        else {
            return this.entities.find(e => (e.entity.key != "" && e.entity.key == pattern));
        }
    }

    static getEntity(pattern: string): DEntity {
        const d = this.findEntity(pattern);
        if (d) return d;
        throw new Error(`Entity "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------
    // 

    static newEntityTemplate(key: string, props: IEntityTemplateProps): DEntityTemplate {
        const data = new DEntityTemplate(this.entityTemplates.length, key, props);
        this.entityTemplates.push(data);
        return data;
    }

    static findEntityTemplate(pattern: string): DEntityTemplate | undefined {
        return this.findHelper(this.entityTemplates, pattern, x => x.key === pattern);
    }

    static getEntityTemplate(pattern: string): DEntityTemplate {
        const d = this.findEntityTemplate(pattern);
        if (d) return d;
        throw new Error(`EntityTemplate "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newPrefab(key: string): DPrefab {
        const data = new DPrefab(this.prefabs.length, key);
        this.prefabs.push(data);
        return data;
    }

    //--------------------------------------------------------------------------

    public static newMap(): DMap {
        const newId = this.maps.length;
        const data = new DMap(newId);
        this.maps.push(data);
        return data;
    }

    public static findMap(pattern: string): DMap | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.maps[id];
        else {
            return this.maps.find(x => (x.name != "" && x.name == pattern));
        }
    }

    public static getMap(pattern: string): DMap {
        const d = this.findMap(pattern);
        if (d) return d;
        throw new Error(`Map "${pattern}" not found.`);
    }


    //--------------------------------------------------------------------------

    static newEffect(key: string): DEffect {
        const newId = this.effects.length;
        const data = new DEffect(newId, key);
        this.effects.push(data);
        return data;
    }

    static cloneEffect(src: DEffect): DEffect {
        const data = this.newEffect(src.key);
        data.copyFrom(src);
        return data;
    }

    static findEffect(pattern: string): DEffect | undefined {
        return this.findHelper(this.effects, pattern, x => x.key == pattern);
    }

    static getEffect(pattern: string): DEffect {
        const d = this.findEffect(pattern);
        if (d) return d;
        throw new Error(`Effect "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newEmittor(key: string): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId, key);
        this.emittors.push(data);
        return data;
    }

    static cloneEmittor(src: DEmittor): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId, src.effectSuite.selfEffect.effect.key);
        data.copyFrom(src);
        this.emittors.push(data);
        return data;
    }
    
    static findEmittor(pattern: string): DEmittor | undefined {
        return this.findHelper(this.emittors, pattern, x => x.key == pattern);
    }

    static getEmittor(pattern: string): DEmittor {
        const d = this.findEmittor(pattern);
        if (d) return d;
        throw new Error(`Emittor "${pattern}" not found.`);
    }

    static getEmittorById(id: DEmittorId): DEmittor {
        const d = this.emittors[id];
        if (d) return d;
        throw new Error(`Effect "${id}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newTerrainShape(key: string): DTerrainShape {
        const newId = this.terrainShapes.length;
        const data = new DTerrainShape(newId);
        data.key = key;
        this.terrainShapes.push(data);
        return data;
    }
    
    static findTerrainShape(pattern: string): DTerrainShape | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.terrainShapes[id];
        else {
            return this.terrainShapes.find(e => (e.key != "" && e.key == pattern));
        }
    }

    static getTerrainShape(pattern: string): DTerrainShape {
        const d = this.findTerrainShape(pattern);
        if (d) return d;
        throw new Error(`TerrainShape "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newTerrainSetting(key: string): DTerrainSetting {
        const newId = this.terrainSettings.length;
        const data = new DTerrainSetting(newId);
        data.key = key;
        this.terrainSettings.push(data);
        return data;
    }
    
    static findTerrainSetting(pattern: string): DTerrainSetting | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.terrainSettings[id];
        else {
            return this.terrainSettings.find(e => (e.key != "" && e.key == pattern));
        }
    }

    static getTerrainSetting(pattern: string): DTerrainSetting {
        const d = this.findTerrainSetting(pattern);
        if (d) return d;
        throw new Error(`TerrainSetting "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newFloorPreset(key: string): DFloorPreset {
        const newId = this.floorPresets.length;
        const data = new DFloorPreset(newId);
        data.key = key;
        this.floorPresets.push(data);
        return data;
    }
    
    static findFloorPreset(pattern: string): DFloorPreset | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.floorPresets[id];
        else {
            return this.floorPresets.find(e => (e.key != "" && e.key == pattern));
        }
    }

    static getFloorPreset(pattern: string): DFloorPreset {
        const d = this.findFloorPreset(pattern);
        if (d) return d;
        throw new Error(`TerrainPreset "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newActor(): [DEntity, DActor] {
        const entity = MRData.newEntity();
        const data = new DActor(MRData.actors.length);
        MRData.actors.push(data.id);
        entity.actor = data;
        return [entity, data];
    }

    static actorEntity(id: DEnemyId): DEntity {
        return this.entities[this.enemies[id]];
    }

    static actorData(id: DEnemyId): DActor {
        return this.actorEntity(id).actorData();
    }

    static findActor(pattern: string): DActor | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.entities[this.actors[id]].actorData();
        else {
            const entityId = this.enemies.find(id => {
                const e = this.entities[id];
                return e.display.name == pattern || (e.entity.key != "" && e.entity.key == pattern);
            });
            if (!entityId)
                return undefined;
            else
                return this.entities[entityId].actorData();
        }
    }

    static getActor(pattern: string): DActor {
        const d = this.findActor(pattern);
        if (d) return d;
        throw new Error(`Actor "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newEffectBehavior(key: string): DSpecialEffect {
        const data = new DSpecialEffect(this.effectBehaviors.length, key);
        this.effectBehaviors.push(data);
        return data;
    }

    
    static findSpecialEffect(pattern: string): DSpecialEffect | undefined {
        return this.findHelper(this.effectBehaviors, pattern, x => x.key == pattern);
    }

    static getSpecialEffect(pattern: string): DSpecialEffect {
        const d = this.findSpecialEffect(pattern);
        if (d) return d;
        throw new Error(`SpecialEffect "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    // static newPreset(key: string): DPreset {
    //     const data = new DPreset(this.presets.length, key);
    //     this.presets.push(data);
    //     return data;
    // }

    //--------------------------------------------------------------------------
    
    static newItem(): [DEntity, DItem] {
        const entity = MRData.newEntity();
        const data = new DItem(MRData.items.length, entity.id);
        MRData.items.push(entity.id);
        entity.itemData = data;
        return [entity, data];
    }

    static itemEntity(id: DItemDataId): DEntity {
        return this.entities[this.items[id]];
    }

    static itemData(id: DItemDataId): DItem {
        return this.itemEntity(id).item();
    }
    
    static findItem(pattern: string): DItem | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.entities[this.items[id]].item();
        else {
            const entityId = this.items.find(id => {
                const e = this.entities[id];
                return e.display.name == pattern || (e.entity.key != "" && e.entity.key == pattern);
            });
            if (!entityId)
                return undefined;
            else
                return this.entities[entityId].item();
        }
    }

    static getItem(pattern: string): DEntity {
        const d = this.findItem(pattern);
        if (d) return this.entities[d.entityId];
        throw new Error(`Item "${pattern}" not found.`);
    }

    static getItemFromRmmzWeaponId(rmmzWeaponId: number): DEntity {
        const id = MRData.items[MRData.weaponDataIdOffset + rmmzWeaponId];
        return this.entities[id];
    }

    static getItemFromRmmzArmorId(rmmzArmorId: number): DEntity {
        const id = MRData.items[MRData.armorDataIdOffset + rmmzArmorId];
        return this.entities[id];
    }
    
    //--------------------------------------------------------------------------

    static newEnemy(): [DEntity, DEnemy] {
        const entity = MRData.newEntity();
        const data = new DEnemy(MRData.enemies.length, entity.id);
        MRData.enemies.push(entity.id);
        entity.enemy = data;
        return [entity, data];
    }

    static enemyEntity(id: DEnemyId): DEntity {
        return this.entities[this.enemies[id]];
    }

    static enemyData(id: DEnemyId): DEnemy {
        return this.enemyEntity(id).enemyData();
    }

    static findEnemy(pattern: string): DEnemy | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.entities[this.enemies[id]].enemyData();
        else {
            const entityId = this.enemies.find(id => {
                const e = this.entities[id];
                return e.display.name == pattern || (e.entity.key != "" && e.entity.key == pattern);
            });
            if (!entityId)
                return undefined;
            else
                return this.entities[entityId].enemyData();
        }
    }

    static getEnemy(pattern: string): DEnemy {
        const d = this.findEnemy(pattern);
        if (d) return d;
        throw new Error(`Enemy "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------
    
    public static newTrait(key: string): DTrait {
        const data = new DTrait(this.traits.length, key);
        MRData.traits.push(data);
        return data;
    }

    public static getTrait(pattern: string): DTrait {
        const data = MRData.traits.find(x => x && x.key == pattern);
        if (data) return data;
        throw new Error(`Trait "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static findPrefab(pattern: string): DPrefab | undefined {
        // TODO: id
        return this.prefabs.find(p => p.key == pattern);
    }

    static getPrefab(pattern: string): DPrefab {
        const d = this.findPrefab(pattern);
        if (d) return d;
        throw new Error(`Prefab "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static findState(pattern: string): DState | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.states[id];
        else
            return this.states.find(x => x.displayName == pattern || (x.key != "" && x.key == pattern));
    }

    static getState(pattern: string): DState {
        const d = this.findState(pattern);
        if (d) return d;
        throw new Error(`State "${pattern}" not found.`);
    }
    
    //--------------------------------------------------------------------------

    static findMonsterHouse(pattern: string): DMonsterHouseType | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.monsterHouses[id];
        else
            return this.monsterHouses.find(x => x.name == pattern/* || (x.key != "" && x.key == pattern)*/);
    }

    static getMonsterHouse(pattern: string): DMonsterHouseType {
        const d = this.findMonsterHouse(pattern);
        if (d) return d;
        throw new Error(`MonsterHouse "${pattern}" not found.`);
    }
    

    //-------------------

    static newSkillAsActivity(key: string, displayName: string, priority?: number): DSkill {
        const data = new DSkill(this.skills.length, key);
        data.name = displayName;
        data.priority = priority ?? 0;
        data.isActivity = true;
        MRData.skills.push(data);
        return data;
    }

    static findSkill(pattern: string): DSkill | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.skills[id];
        else
            return this.skills.find(x => x.name == pattern || (x.key != "" && x.key == pattern));
    }

    static getSkill(pattern: string): DSkill {
        const d = this.findSkill(pattern);
        if (d) return d;
        throw new Error(`Skill "${pattern}" not found.`);
    }

    //--------------------------------------------------------------------------

    static newQuest(key: string): DQuest {
        const data = new DQuest(this.quests.length, key);
        this.quests.push(data);
        return data;
    }

    static findQuest(pattern: string): DQuest | undefined {
        return this.findHelper(this.quests, pattern, x => x.key === pattern);
    }

    static getQuest(pattern: string): DQuest {
        const d = this.findQuest(pattern);
        if (!d) throw new Error(`Quest "${pattern}" not found.`);
        return d;
    }

    //--------------------------------------------------------------------------

    public static verify(): void {
        this.entities.forEach(x => x.verify());
    }

    public static findHelper<T>(list: T[], pattern: string, predicate: (x: T) => boolean): T | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return list[id];
        else {
            return list.find(predicate);
        }
    }
}