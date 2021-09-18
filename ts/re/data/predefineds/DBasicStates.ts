import { DSkillId } from "../DCommon";
import { DStateId } from "../DState";

/**
 * REシステムとして特定のタイミングで必要となる State を列挙する。
 */
export interface DBasicStates {
    
    dead: DStateId,         // 戦闘不能
    
    /** モンスター出現時に追加される仮眠ステータス */
    nap: DStateId;
    
    /*
    speedDown: DStateId,    // 鈍足
    speedUp: DStateId,      // 倍速
    confusion: DStateId,    // 混乱
    sleep: DStateId,        // 睡眠
    blind: DStateId,        // 目つぶし
    paralysis: DStateId,    // かなしばり
    sealed: DStateId,       // 封印
    substitute: DStateId,   // 身代わり
    transparent: DStateId,  // 透明
    sightThrough: DStateId, // 透視
    sharpEar: DStateId,     // 地獄耳
    clairvoyant: DStateId,  // 千里眼
    deception: DStateId,    // まどわし
    mouthClosed: DStateId,  // くちなし
    */
    debug_MoveRight: DStateId,
}
