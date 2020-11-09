
export interface EntityId {
    index: number;
    key: number;
}

export function eqaulsEntityId(a: EntityId, b: EntityId): boolean {
    return a.index == b.index && a.key == b.key;
}
