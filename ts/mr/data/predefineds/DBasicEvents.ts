import { LEntity } from "ts/mr/lively/LEntity";
import { DSkillId } from "../DCommon";

export type DEventId = number;

export interface RoomEventArgs {
    entity: LEntity;
    newRoomId: number,
    oldRoomId: number,
}

export interface WalkEventArgs {
    walker: LEntity;
    targetX: number;
    targetY: number;
}

export interface PutEventArgs {
    actor: LEntity;
}

export interface SkillEmittedArgs {
    performer: LEntity;
    targets: LEntity[];
    skillId: DSkillId;  // Skill ではない場合は 0.
}

export interface ItemRemovedFromInventoryArgs {
    item: LEntity;
}

// TODO: symbol や string にしたほうがいいかも。
export interface DBasicEvents {
    /** 何らかの Entity が部屋に侵入した */
    roomEnterd: DEventId, // RoomEventArgs
    roomLeaved: DEventId, // RoomEventArgs

    preWalk: DEventId,
    walked: DEventId,

    prePut: DEventId,
    
    effectReacted: DEventId,

    /**
     * スキル発動後。スキル自体の発動失敗 (MP切れ等) では発生しない。
     * 発動した場合はターゲットの有無・命中有無にかかわらず、このイベントが発生する。
     */
    skillEmitted: DEventId, // SkillEmittedArgs

    itemRemovedFromInventory: DEventId, // ItemRemovedFromInventoryArgs
}

