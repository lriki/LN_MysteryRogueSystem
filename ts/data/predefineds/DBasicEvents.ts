import { LEntity } from "ts/objects/LEntity";

export type DEventId = number;

export interface RoomEventArgs {
    entity: LEntity;
    newRoomId: number,
    oldRoomId: number,
}

export interface DBasicEvents {
    /** 何らかの Entity が部屋に侵入した */
    roomEnterd: DEventId, // RoomEventArgs
    roomLeaved: DEventId, // RoomEventArgs
}

