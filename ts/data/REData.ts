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
import { DAction } from "./DAction";
import { DEquipmentType } from "./DEquipmentType";
import { DEquipmentPart } from "./DEquipmentPart";
import { DActor_Default, RE_Data_Actor } from "./DActor";
import { DAbility, DAbilityId } from "./DAbility";
import { DMonsterHouse } from "./DMonsterHouse";
import { LActivity } from "ts/objects/activities/LActivity";

export type DParameterId = number;


export enum REFloorMapKind
{
    // データ定義用のマップ。ここへの遷移は禁止
    Land,

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
 * フロアひとつ分。
 * 
 * インスタンスは REData.floors に格納され、$dataMapInfos.length 以下の ID はそれの ID、つまり RMMZ のマップ ID と等しい。
 * それ以降には、ランダムダンジョンとしてのフロア情報が、最大階層の分だけ生成される。
 * 例えば RMMZ で作成したマップの数が 100 個、Land の数が 3 個とすると、次のようになる。
 * - 0~100: RMMZ マップと対応する Floor
 * - 101~200: Land[1] の F1 ~ F100 (TODO: この数は、今は MAX_DUNGEON_FLOORS で固定)
 * - 201~300: Land[2] の F1 ~ F100
 * - 301~400: Land[3] の F1 ~ F100
 */
export interface RE_Data_Floor
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
    static floors: RE_Data_Floor[] = [];    // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.
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
        this.addActor("null");

        this.monsters = [{ id: 0, key: "", name: 'null', exp: 0, idealParams:[], traits: [] }];
        this.lands = [];
        this.floors = [{ id: 0, mapId: 0, landId: 0, mapKind: REFloorMapKind.FixedMap }];
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
     * Add actor.
     */
    static addActor(name: string): number {
        const newId = this.actors.length;
        this.actors.push({
            ...DActor_Default,
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
    static addFloor(mapId: number, landId: number, kind: REFloorMapKind): number {
        const newId = this.floors.length;
        this.floors.push({
            id: newId,
            mapId: mapId,
            landId: landId,
            mapKind: kind,
        });
        return newId;
    }
    
    static addAction(displayName: string, typeName: string, factory: () => LActivity): number {
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
            ...DSkill_Default,
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

    static getItem(re_key: string): DItem {
        const d = this.findItem(re_key);
        if (d) return d;
        throw new Error(`Item "${re_key}" not found.`);
    }
}