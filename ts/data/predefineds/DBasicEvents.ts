import { LEntity } from "ts/objects/LEntity";

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

// TODO: symbol や string にしたほうがいいかも。
export interface DBasicEvents {
    /** 何らかの Entity が部屋に侵入した */
    roomEnterd: DEventId, // RoomEventArgs
    roomLeaved: DEventId, // RoomEventArgs

    preWalk: DEventId,
    prePut: DEventId,
}

