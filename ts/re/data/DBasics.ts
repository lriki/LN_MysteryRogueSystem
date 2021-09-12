import { DEntityKindId } from "./DEntityKind";
import { DBasicActions } from "./predefineds/DBasicActions";
import { BasicEntityKinds } from "./predefineds/DBasicEntityKinds";
import { DBasicEvents } from "./predefineds/DBasicEvents";
import { DBasicItemShops } from "./predefineds/DBasicItemShops";
import { DBasicMonsterHouses } from "./predefineds/DBasicMonsterHouses";
import { DBasicParameters, DBasicSParams, DBasicXParams } from "./predefineds/DBasicParameters";
import { DBasicPrefabs } from "./predefineds/DBasicPrefabs";
import { DBasicStates } from "./predefineds/DBasicStates";
import { DBasicStateTraits } from "./predefineds/DBasicTraits";
import { DFactionId } from "./REData";


/**
 * ゲームシステムとして重要な定義済みデータを保持する
 */
export class DBasics {
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
}
