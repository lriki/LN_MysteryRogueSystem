
export type DPrefabId = number;

/** Prefab の大分類 */
export enum DPrefabKind {
    Unknown,
    Enemy,
    Trap,
    Item,
    System,
}

export interface DPrefab {
    id: DPrefabId;
    key: string;
    kind: DPrefabKind;
    rmmzDataKey: string,
}

export function DPrefab_Default(): DPrefab {
    return {
        id: 0,
        key: "",
        kind: DPrefabKind.Unknown,
        rmmzDataKey: "",
    };
}
