import { DAttackElementId, DSpecificEffectId as DSpecialEffectId } from "./DCommon";
import { DBasicActions } from "./predefineds/DBasicActions";
import { BasicEntityKinds } from "./predefineds/DBasicEntityKinds";
import { DBasicEvents } from "./predefineds/DBasicEvents";
import { DBasicItemShops } from "./predefineds/DBasicItemShops";
import { DBasicMonsterHouses } from "./predefineds/DBasicMonsterHouses";
import { DBasicParameters, DBasicSParams, DBasicXParams } from "./predefineds/DBasicParameters";
import { DBasicPrefabs } from "./predefineds/DBasicPrefabs";
import { BasicSequels } from "./predefineds/DBasicSequels";
import { DBasicStates } from "./predefineds/DBasicStates";
import { DBasicTraits } from "./predefineds/DBasicTraits";
import { DFactionId } from "./REData";

export interface DBasicVariables {
    result: number,
}

export interface DBasicElements {
    explosion: DAttackElementId,
}

export interface DBasicSpecialEffects {
    itemSteal: DSpecialEffectId;
    goldSteal: DSpecialEffectId;
    levelDown: DSpecialEffectId;
    warp: DSpecialEffectId;
    stumble: DSpecialEffectId;
    transferToNextFloor: DSpecialEffectId;
    transferToLowerFloor: DSpecialEffectId;
    trapProliferation: DSpecialEffectId;

    /** @deprecated SubComponent の検索ができるようになったので、それで対応する。SpecialEffect 内で実装する場合、EffectResult を自分で表示するような使実装が必要になる。 */
    dispelEquipments: DSpecialEffectId;

    changeInstance: DSpecialEffectId;
    restartFloor: DSpecialEffectId;
    clarification: DSpecialEffectId;
    division: DSpecialEffectId;
    removeStatesByIntentions: DSpecialEffectId;
}

export enum DClarificationType {
    Unit,
    Item,
    Trap,
    Terrain,
    Sight,
}

// export interface DBasicPresets {
//     trap: DPresetId,
// }

/**
 * ゲームシステムとして重要な定義済みデータを保持する
 */
export class REBasics {
    static variables: DBasicVariables;
    static elements: DBasicElements;
    static events: DBasicEvents;
    static actions: DBasicActions;
    static entityKinds: BasicEntityKinds;
    //static stateTraits: DBasicStateTraits;
    static states: DBasicStates;
    static params: DBasicParameters;
    static xparams: DBasicXParams;
    static sparams: DBasicSParams;
    static monsterHouses: DBasicMonsterHouses;
    static itemShops: DBasicItemShops;
    static prefabs: DBasicPrefabs;
    static sequels: BasicSequels;
    static effectBehaviors: DBasicSpecialEffects;
    static traits: DBasicTraits;
    // static presets: DBasicPresets;
}

