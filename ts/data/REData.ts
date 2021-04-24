import { LAttribute } from "ts/objects/attributes/LAttribute";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { isParameter } from "typescript";
import { REData_Attribute, REData_Behavior } from "./REDataTypes";
import { DState, DState_makeDefault } from "./DState";
import { DSystem } from "./DSystem";
import { DEffectHitType, DEffect_Default, DSkill, DSkill_Default } from "./DSkill";
import { DClass, DClassId, DClass_Default } from "./DClass";
import { DItem, DItem_Default } from "./DItem";
import { DLand, DLand_Default } from "./DLand";
import { DEntityKind, DEntityKindId } from "./DEntityKind";
import { DStateTrait } from "./DStateTrait";
import { DSequel } from "./DSequel";
import { RE_Data_Monster } from "./DEnemy";
import { DAction, DActionId } from "./DAction";
import { DEquipmentType } from "./DEquipmentType";
import { DEquipmentPart } from "./DEquipmentPart";
import { RE_Data_Actor } from "./DActor";
import { DAbility, DAbilityId } from "./DAbility";
import { DMonsterHouse } from "./DMonsterHouse";
import { LActivity } from "ts/objects/activities/LActivity";
import { assert } from "ts/Common";
import { DTemplateMap, DTemplateMapId, DTemplateMap_Default } from "./DMap";
import { DPrefab } from "./DPrefab";


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


export interface REData_Parameter
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;
}

export class REData
{
    static readonly MAX_DUNGEON_FLOORS = 100;

    
    // Common defineds.
    static ActorDefaultFactionId: number = 1;
    static EnemeyDefaultFactionId: number = 2;

    static NormalAttackSkillId: number = 1;

    static system: DSystem;
    //static equipTypes: DEquipmentType[] = [];
    static equipmentParts: DEquipmentPart[] = [];
    static entityKinds: DEntityKind[] = [];
    static classes: DClass[] = [];
    static actors: RE_Data_Actor[] = [];
    static monsters: RE_Data_Monster[] = [];
    static lands: DLand[] = [DLand_Default()];
    static maps: DMap[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
    static templateMaps: DTemplateMap[] = [];
    static factions: REData_Faction[] = [];
    static actions: DAction[] = [];
    static sequels: DSequel[] = [{id: 0, name: 'null', parallel: false}];
    static parameters: REData_Parameter[] = [{id: 0, name: 'null'}];
    static attributes: REData_Attribute[] = [{id: 0, name: 'null'}];
    static behaviors: REData_Behavior[] = [{id: 0, name: 'null'}];
    static skills: DSkill[] = [];
    static items: DItem[] = [];
    static stateTraits: DStateTrait[] = [];
    static states: DState[] = [];
    static abilities: DAbility[] = [];
    static monsterHouses: DMonsterHouse[] = [];
    static prefabs: DPrefab[] = [];

    static itemDataIdOffset: number = 0;
    static weaponDataIdOffset: number = 0;
    static armorDataIdOffset: number = 0;
    //static rmmzWeaponTypeIdOffset: number = 0;
    //static rmmzArmorTypeIdOffset: number = 0;

    static _attributeFactories: (() => LAttribute)[] = [];
    static _behaviorFactories: (() => LBehavior)[] = [];

    static reset() {
        this.entityKinds = [{ id: 0, displayName: 'null', prefabKind: "" }];

        this.classes = [];
        this.addClass("null");

        this.actors = [];

        this.monsters = [{ id: 0, key: "", name: 'null', exp: 0, idealParams:[], traits: [] }];
        this.lands = [];
        this.maps = [{ id: 0, mapId: 0, landId: 0, mapKind: REFloorMapKind.FixedMap }];
        this.templateMaps = [DTemplateMap_Default()];
        this.factions = [];
        this.actions = [{id: 0, displayName: 'null', typeName: "", factory: () => new LActivity()}];
        this.sequels = [{id: 0, name: 'null', parallel: false}];
        this.parameters = [];
        this.attributes = [{id: 0, name: 'null'}];
        this.behaviors = [{id: 0, name: 'null'}];

        this.skills = [];
        this.addSkill("null");

        this.items = [];
        this.addItem("null");

        this.states = [DState_makeDefault()];
        this._attributeFactories = [() => new LAttribute()];
        this._behaviorFactories = [() => new LBehavior()];
        this.prefabs = [new DPrefab()];
    }

    static addEntityKind(name: string, prefabKind: string): number {
        const newId = this.entityKinds.length;
        this.entityKinds.push({
            id: newId,
            displayName: name,
            prefabKind: prefabKind,
        });
        return newId;
    }
    
    static getEntityKindsId(prefabKind: string): DEntityKindId {
        const index = this.entityKinds.findIndex(x => x.prefabKind == prefabKind);
        if (index >= 0)
            return index;
        else
            throw new Error(`EntityKind '${prefabKind}' not found.`);
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
    
    /**
     * Add Monster.
     */
    static addMonster(name: string): number {
        const newId = this.monsters.length;
        this.monsters.push({
            id: newId,
            key: "",
            name: name,
            exp: 0,
            idealParams: [],
            traits: []
        });
        return newId;
    }

    /**
     * Add floor.
     * @param mapId : RMMZ mapID
     */
    static addMap(mapId: number, landId: number, kind: REFloorMapKind): number {
        const newId = this.maps.length;
        this.maps.push({
            id: newId,
            mapId: mapId,
            landId: landId,
            mapKind: kind,
        });
        return newId;
    }
    
    static addAction(displayName: string, typeName: string, factory: (() => LActivity) | undefined): number {
        const newId = this.actions.length;
        this.actions.push({
            id: newId,
            displayName: displayName,
            typeName: typeName,
            factory: factory,
        });
        return newId;
    }

    static addParameter(name: string): number {
        const newId = this.parameters.length;
        this.parameters.push({
            id: newId,
            name: name
        });
        return newId;
    }

    static addAttribute(name: string, factory: (() => LAttribute)): number {
        const newId = this.attributes.length;
        this.attributes.push({
            id: newId,
            name: name,
        });
        this._attributeFactories.push(factory);
        return newId;
    }
    
    static addBehavior(name: string, factory: (() => LBehavior)): number {
        const newId = this.behaviors.length;
        this.behaviors.push({
            id: newId,
            name: name,
        });
        this._behaviorFactories.push(factory);
        return newId;
    }
    
    static addSkill(name: string): number {
        const newId = this.skills.length;
        this.skills.push({
            ...DSkill_Default(),
            id: newId,
            name: name,
            effect: {
                critical: false,
                successRate: 100,
                hitType: DEffectHitType.Certain,
                parameterEffects: [],
                specialEffects: [],
            },
        });
        return newId;
    }
    
    static addItem(name: string): number {
        const newId = this.items.length;
        this.items.push({
            ...DItem_Default(),
            id: newId,
            name: name,
            effect: {
                critical: false,
                successRate: 100,
                hitType: DEffectHitType.Certain,
                parameterEffects: [],
                specialEffects: [],
            },
        });
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
    
    
    static findItem(re_key: string): DItem | undefined {
        return this.items.find(x => x.entity.key == re_key);
    }

    static findItemFuzzy(pattern: string): DItem | undefined {
        const id = parseInt(pattern);
        if (!isNaN(id)) 
            return this.items[id];
        else
            return this.items.find(x => x.name == pattern || x.entity.key == pattern);
    }

    static getItem(re_key: string): DItem {
        const d = this.findItem(re_key);
        if (d) return d;
        throw new Error(`Item "${re_key}" not found.`);
    }

    static getItemFuzzy(pattern: string): DItem {
        const d = this.findItemFuzzy(pattern);
        if (d) return d;
        throw new Error(`Item "${pattern}" not found.`);
    }

    static findPrefabFuzzy(pattern: string): DPrefab | undefined {
        // TODO: id
        return this.prefabs.find(p => p.key == pattern);
    }

    static createActivity(actionId: DActionId): LActivity {
        const f = this.actions[actionId].factory;
        assert(f);
        return f();
    }
}