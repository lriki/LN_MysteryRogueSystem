import { LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { REData_Attribute, REData_Behavior } from "./REDataTypes";
import { DState } from "./DState";
import { DSystem } from "./DSystem";
import { DSkill } from "./DSkill";
import { DClass, DClass_Default } from "./DClass";
import { DItem, DItemDataId } from "./DItem";
import { DLand } from "./DLand";
import { DEntityKind } from "./DEntityKind";
import { DSequel } from "./DSequel";
import { DEnemy, DEnemyId } from "./DEnemy";
import { DAction } from "./DAction";
import { DEquipmentPart } from "./DEquipmentPart";
import { RE_Data_Actor } from "./DActor";
import { DAbility } from "./DAbility";
import { DMonsterHouseType } from "./DMonsterHouse";
import { DTemplateMap, DTemplateMap_Default } from "./DMap";
import { DPrefab } from "./DPrefab";
import { DTrait } from "./DTraits";
import { REData_Parameter } from "./DParameter";
import { DEntity, DEntityId } from "./DEntity";
import { DTroop } from "./DTroop";
import { DStateGroup } from "./DStateGroup";
import { DPseudonymous } from "./DPseudonymous";
import { DItemShopType } from "./DItemShop";
import { REDataExtension } from "./REDataExtension";
import { DEmittor, DEmittorId } from "./DEmittor";
import { DAttackElement } from "./DAttackElement";


export enum REFloorMapKind
{
    // データ定義用のマップ。ここへの遷移は禁止
    Land,

    TemplateMap,

    FixedMap,
    ShuffleMap,
    RandomMap,
}

/**
 * [2020/9/6] 種別によるクラス分類はしない
 * ----------
 * ツクールのように、Data_Item,Data_Weapon,Data_Armer といったクラス分けは行わない。
 * これは、
 * 1. 本システムとしてアイテムの効果はすべて Feature によって決まるものであるため。
 *    コンポーネント思考と同じ考え方で、Feature をアタッチすることで Item を作り上げていく。
 * 2. タイトルによっては種類の拡張があり得る。城の材料など。
 * 
 * ただし、武器、防具 あたりはツクールのデータベースからインポートしてくるため、
 * これらに対応する Item はデフォルトで 武器、防具の Feature を持つことになる。
 */
export interface RE_Data_Entity
{
    /** ID (0 is Invalid). */
    id : number;

    /** Name. */
    name: string;

    /** 買い値（販売価格） */
    buyingPrice: number;

    /** 売り値 */
    sellingPrice: number;

    /** Index of  */
    kindId: number;
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
    static sequels: DSequel[] = [{id: 0, name: 'null', parallel: false}];
    static parameters: REData_Parameter[] = [];
    static attributes: REData_Attribute[] = [{id: 0, name: 'null'}];
    static behaviors: REData_Behavior[] = [{id: 0, name: 'null'}];
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
        this.sequels = [{id: 0, name: 'null', parallel: false}];
        this.parameters = [];
        this.attributes = [{id: 0, name: 'null'}];
        this.behaviors = [{id: 0, name: 'null'}];

        this.skills = [];

        this.items = [];

        this.states = [];
        //this._behaviorFactories = [() => new LBehavior()];
        this.prefabs = [new DPrefab()];
        this.entities = [new DEntity(0)];
        this.emittors = [new DEmittor(0)];
    }

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
    
    static addSequel(name: string): number {
        const newId = this.sequels.length;
        this.sequels.push({
            id: newId,
            name: name,
            parallel: false,
        });
        return newId;
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

    static newEmittor(): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId);
        this.emittors.push(data);
        return data;
    }

    static cloneEmittor(src: DEmittor): DEmittor {
        const newId = this.emittors.length;
        const data = new DEmittor(newId);
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
    
/*     static findItem(re_key: string): DItem | undefined {
        return this.items.find(x => x.entity.key == re_key);
    }
 */
    static findItemFuzzy(pattern: string): DItem | undefined {
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

/*     static getItem(re_key: string): DItem {
        const d = this.findItem(re_key);
        if (d) return d;
        throw new Error(`Item "${re_key}" not found.`);
    }
 */
    static getItemFuzzy(pattern: string): DEntity {
        const d = this.findItemFuzzy(pattern);
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

    static findPrefabFuzzy(pattern: string): DPrefab | undefined {
        // TODO: id
        return this.prefabs.find(p => p.key == pattern);
    }

    static getPrefab(pattern: string): DPrefab {
        const d = this.findPrefabFuzzy(pattern);
        if (d) return d;
        throw new Error(`Prefab "${pattern}" not found.`);
    }

    static findStateFuzzy(pattern: string): DState | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.states[id];
        else
            return this.states.find(x => x.displayName == pattern || (x.key != "" && x.key == pattern));
    }

    static getStateFuzzy(pattern: string): DState {
        const d = this.findStateFuzzy(pattern);
        if (d) return d;
        throw new Error(`State "${pattern}" not found.`);
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

    //--------------------

    public static verify(): void {
        this.entities.forEach(x => x.verify());
    }
}