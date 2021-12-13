import { LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { REData_Attribute, REData_Behavior } from "./REDataTypes";
import { DState } from "./DState";
import { DSystem } from "./DSystem";
import { DSpecialEffect, DSkill } from "./DSkill";
import { DClass, DClass_Default } from "./DClass";
import { DItem, DItemDataId } from "./DItem";
import { DLand } from "./DLand";
import { DEntityKind } from "./DEntityKind";
import { DSequel, DSequelId } from "./DSequel";
import { DEnemy, DEnemyId } from "./DEnemy";
import { DAction } from "./DAction";
import { DEquipmentPart } from "./DEquipmentPart";
import { RE_Data_Actor } from "./DActor";
import { DAbility } from "./DAbility";
import { DMonsterHouseType } from "./DMonsterHouse";
import { DTemplateMap, DTemplateMap_Default } from "./DMap";
import { DPrefab } from "./DPrefab";
import { DTrait } from "./DTraits";
import { DParameterId, REData_Parameter } from "./DParameter";
import { DEntity, DEntityId } from "./DEntity";
import { DTroop } from "./DTroop";
import { DStateGroup } from "./DStateGroup";
import { DPseudonymous } from "./DPseudonymous";
import { DItemShopType } from "./DItemShop";
import { REDataExtension } from "./REDataExtension";
import { DEmittor, DEmittorId } from "./DEmittor";
import { DAttackElement } from "./DAttackElement";
import { assert } from "../Common";
// import { DPreset } from "./DPreset";


export enum REFloorMapKind
{
    // データ定義用のマップ。ここへの遷移は禁止
    Land,

    TemplateMap,

    FixedMap,
    ShuffleMap,
    RandomMap,
}



// NOTE: これをもとに Behavior を作る仕組みが必要そう。
export interface RE_Data_EntityFeature
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name. */
    name: string;


}





/**
 * マップデータ。RMMZ の MapInfo 相当で、その ID と一致する。
 */
export interface DMap
{
    /** ID (0 is Invalid). */
    id: number;

    /** Parent Land. */
    landId: number;

    /** RMMZ mapID. (0 is RandomMap) */
    mapId: number;

    /** マップ生成 */
    mapKind: REFloorMapKind;

    exitMap: boolean;
    
    /** 非REシステムマップにおいて、RMMZオリジナルのメニューを使うか。(つまり、一切 RE システムと関係ないマップであるか) */
    defaultSystem: boolean;
}

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

export class REData
{
    static readonly MAX_DUNGEON_FLOORS = 100;
    static testMode = false;

    
    // Common defineds.
    static NormalAttackSkillId: number = 1;

    static ext: REDataExtension = new REDataExtension();

    static system: DSystem;
    //static equipTypes: DEquipmentType[] = [];
    static attackElements: DAttackElement[] = [];
    static equipmentParts: DEquipmentPart[] = [];
    static entityKinds: DEntityKind[] = [];
    static classes: DClass[] = [];
    static actors: DEntityId[] = [];
    static enemies: DEntityId[] = [];
    static lands: DLand[] = [];
    static maps: DMap[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
    static templateMaps: DTemplateMap[] = [];
    static factions: REData_Faction[] = [];
    static actions: DAction[] = [];
    static sequels: DSequel[] = [{id: 0, name: 'null', parallel: false, fluidSequence: false}];
    static parameters: REData_Parameter[] = [];
    static attributes: REData_Attribute[] = [{id: 0, name: 'null'}];
    static behaviors: REData_Behavior[] = [{id: 0, name: 'null'}];
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
    static troops: DTroop[] = [];
    static emittors: DEmittor[] = [];
    static pseudonymous: DPseudonymous = new DPseudonymous();

    static itemDataIdOffset: number = 0;
    static weaponDataIdOffset: number = 0;
    static armorDataIdOffset: number = 0;
    //static rmmzWeaponTypeIdOffset: number = 0;
    //static rmmzArmorTypeIdOffset: number = 0;

    static _behaviorFactories: (() => LBehavior)[] = [];

    static reset() {
        this.entityKinds = [{ id: 0, displayName: 'null', name: "" }];

        this.classes = [];
        this.addClass("null");

        this.actors = [];

        this.enemies = [];
        this.lands = [];
        this.maps = [{ id: 0, mapId: 0, landId: 0, mapKind: REFloorMapKind.FixedMap, exitMap: false, defaultSystem: false }];
        this.templateMaps = [DTemplateMap_Default()];
        this.factions = [];
        this.actions = [{id: 0, displayName: 'null', typeName: "", priority: 0}];
        this.sequels = [{id: 0, name: 'null', parallel: false, fluidSequence: false}];
        this.parameters = [];
        this.attributes = [{id: 0, name: 'null'}];
        this.behaviors = [{id: 0, name: 'null'}];

        this.effectBehaviors = [new DSpecialEffect(0, "null")];
        // this.presets = [new DPreset(0, "null")];
        this.skills = [];
        this.items = [];

        this.states = [];
        //this._behaviorFactories = [() => new LBehavior()];
        this.prefabs = [new DPrefab()];
        this.entities = [new DEntity(0)];
        this.emittors = [new DEmittor(0, "null")];
    }

    //--------------------

    static getAttackElement(pattern: string): DAttackElement {
        const d = this.attackElements.find(e => (e.key != "" && e.key == pattern));
        if (d) return d;
        throw new Error(`AttackElement "${pattern}" not found.`);
    }

    //--------------------

    static addEntityKind(displayName: string, name: string): number {
        const newId = this.entityKinds.length;
        this.entityKinds.push({
            id: newId,
            name: name,
            displayName: displayName,
        });
        return newId;
    }

    static findEntityKind(pattern: string): DEntityKind | undefined {
        const k = pattern.toLowerCase();
        const kind = REData.entityKinds.find(x => x.name.toLowerCase() === k);
        return kind;
    }

    static getEntityKind(pattern: string): DEntityKind {
        const kind = this.findEntityKind(pattern);
        if (!kind) throw new Error(`EntityKind "${pattern}" not found.`);
        return kind;
    }
    
    /**
     * Add class.
     */
    static addClass(name: string): number {
        const newId = this.classes.length;
        this.classes.push({
            ...DClass_Default,
            id: newId,
            name: name,
        });
        return newId;
    }
    
    static addAction(displayName: string, typeName: string, priority?: number): number {
        const newId = this.actions.length;
        this.actions.push({
            id: newId,
            displayName: displayName,
            typeName: typeName,
            priority: priority ?? 0,
        });
        return newId;
    }

    /*
    static addParameter(name: string): number {
        const newId = this.parameters.length;
        this.parameters.push({
            id: newId,
            name: name
        });
        return newId;
    }
    */

    static addBehavior(name: string, factory: (() => LBehavior)): number {
        const newId = this.behaviors.length;
        this.behaviors.push({
            id: newId,
            name: name,
        });
        this._behaviorFactories.push(factory);
        return newId;
    }
    
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

    static addParams(name: string): REData_Parameter {
        const newId = this.parameters.length;
        const data = new REData_Parameter(newId, name);
        this.parameters.push(data);
        return data;
    }

    static newEntity(): DEntity {
        const newId = this.entities.length;
        const data = new DEntity(newId);
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

    //--------------------

    static newEmittor(sourceKey: string): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId, sourceKey);
        this.emittors.push(data);
        return data;
    }

    static cloneEmittor(src: DEmittor): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId, src.effectSet.selfEffect.sourceKey);
        data.copyFrom(src);
        this.emittors.push(data);
        return data;
    }
    
    static getEmittorById(id: DEmittorId): DEmittor {
        const d = this.emittors[id];
        if (d) return d;
        throw new Error(`Effect "${id}" not found.`);
    }

    //--------------------

    static newActor(): [DEntity, RE_Data_Actor] {
        const entity = REData.newEntity();
        const data = new RE_Data_Actor(REData.actors.length);
        REData.actors.push(data.id);
        entity.actor = data;
        return [entity, data];
    }

    static actorEntity(id: DEnemyId): DEntity {
        return this.entities[this.enemies[id]];
    }

    static actorData(id: DEnemyId): RE_Data_Actor {
        return this.actorEntity(id).actorData();
    }

    static findActor(pattern: string): RE_Data_Actor | undefined {
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

    static getActor(pattern: string): RE_Data_Actor {
        const d = this.findActor(pattern);
        if (d) return d;
        throw new Error(`Actor "${pattern}" not found.`);
    }

    //--------------------

    static newEffectBehavior(key: string): DSpecialEffect {
        const data = new DSpecialEffect(this.effectBehaviors.length, key);
        this.effectBehaviors.push(data);
        return data;
    }

    //--------------------

    // static newPreset(key: string): DPreset {
    //     const data = new DPreset(this.presets.length, key);
    //     this.presets.push(data);
    //     return data;
    // }

    //--------------------
    
    static newItem(): [DEntity, DItem] {
        const entity = REData.newEntity();
        const data = new DItem(REData.items.length, entity.id);
        REData.items.push(entity.id);
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

    //--------------------

    static newEnemy(): [DEntity, DEnemy] {
        const entity = REData.newEntity();
        const data = new DEnemy(REData.enemies.length, entity.id);
        REData.enemies.push(entity.id);
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

    //--------------------
    
    public static newTrait(key: string): DTrait {
        const data = new DTrait(this.traits.length, key);
        REData.traits.push(data);
        return data;
    }

    public static getTrait(pattern: string): DTrait {
        const data = REData.traits.find(x => x && x.key == pattern);
        if (data) return data;
        throw new Error(`Trait "${pattern}" not found.`);
    }

    //--------------------

    static findPrefab(pattern: string): DPrefab | undefined {
        // TODO: id
        return this.prefabs.find(p => p.key == pattern);
    }

    static getPrefab(pattern: string): DPrefab {
        const d = this.findPrefab(pattern);
        if (d) return d;
        throw new Error(`Prefab "${pattern}" not found.`);
    }

    //--------------------

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
    

    //-------------------

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

    //--------------------

    public static verify(): void {
        this.entities.forEach(x => x.verify());
    }
}