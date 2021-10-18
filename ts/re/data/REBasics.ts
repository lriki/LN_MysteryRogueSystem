import { DEffectBehaviorId } from "./DCommon";
import { DBasicActions } from "./predefineds/DBasicActions";
import { BasicEntityKinds } from "./predefineds/DBasicEntityKinds";
import { DBasicEvents } from "./predefineds/DBasicEvents";
import { DBasicItemShops } from "./predefineds/DBasicItemShops";
import { DBasicMonsterHouses } from "./predefineds/DBasicMonsterHouses";
import { DBasicParameters, DBasicSParams, DBasicXParams } from "./predefineds/DBasicParameters";
import { DBasicPrefabs } from "./predefineds/DBasicPrefabs";
import { BasicSequels } from "./predefineds/DBasicSequels";
import { DBasicStates } from "./predefineds/DBasicStates";
import { DBasicStateTraits, DBasicTraits } from "./predefineds/DBasicTraits";
import { DFactionId } from "./REData";

export interface DBasicEffectBehaviors {
    itemSteal: DEffectBehaviorId,
    goldSteal: DEffectBehaviorId,
    levelDown: DEffectBehaviorId,
    warp: DEffectBehaviorId,
}

/**
 * ゲームシステムとして重要な定義済みデータを保持する
 */
export class REBasics {
    static events: DBasicEvents;
    static actions: DBasicActions;
    static entityKinds: BasicEntityKinds;
    static stateTraits: DBasicStateTraits;
    static states: DBasicStates;
    static params: DBasicParameters;
    static xparams: DBasicXParams;
    static sparams: DBasicSParams;
    static monsterHouses: DBasicMonsterHouses;
    static itemShops: DBasicItemShops;
    static prefabs: DBasicPrefabs;
    static sequels: BasicSequels;
    static effectBehaviors: DBasicEffectBehaviors;
    static traits: DBasicTraits;
}

