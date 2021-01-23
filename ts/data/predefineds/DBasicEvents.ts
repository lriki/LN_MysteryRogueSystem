import { REGame_Entity } from "ts/objects/REGame_Entity";

export type DEventId = number;

export interface RoomEventArgs {
    entity: REGame_Entity;
    newRoomId: number,
    oldRoomId: number,
}

export interface DBasicEvents {
    /** 何らかの Entity が部屋に侵入した */
    roomEnterd: DEventId, // RoomEventArgs
    roomLeaved: DEventId, // RoomEventArgs
}

