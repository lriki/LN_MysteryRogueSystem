
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
