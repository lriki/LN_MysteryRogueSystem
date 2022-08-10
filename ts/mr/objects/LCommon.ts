import { DActionId } from "../data/DCommon";

export type LRoomId = number;
export type LStructureId = number;

export interface LPriceInfo {
    sellingPrice: number;
    purchasePrice: number;
}

export const phaseCount = 4;

export enum LMinimapMarkerClass {
    /** 表示なし */
    None,

    /** ユニット。最終的なマーカーは、視点の Entity と勢力によって決まる。 */
    Unit,

    Item,

    Trap,

    ExitPoint,
}




export enum LActionTokenConsumeType {
    /** MinorAction を実行した。 MinorToken を1つ消費する。 */
    MinorActed,

    /** MajorAction を実行した。 MajorToken を1つ消費する。 */
    MajorActed,

    /** 待機した。Major を優先的に消費する。 */
    WaitActed,
}

export interface LReaction {
    actionId: DActionId;
    displayName?: string | undefined;
}
