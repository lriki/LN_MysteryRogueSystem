import { assert } from "ts/Common";


export interface LObjectId {
    index: number;
    key: number;
}

export function eqaulsObjectId(a: LObjectId, b: LObjectId): boolean {
    return a.index == b.index && a.key == b.key;
}

// Entity をフィールドに保持する人
/**
 * 
 * Parent Object について
 * ----------
 * 自分自身の Object の "居場所" を示すためのプロパティです。
 * 
 * 
 * 
 * 
 * NOTE:
 * - 現在 Map の Adhoc Entity の Parent は Map となる。
 * - UniqueEntity の 
 */
export class LObject {
    _id: LObjectId = { index: 0, key: 0 };
    
    /**
     * 親 Entity。
     * 例えば Inventory に入っている Entity は、その Inventory を持つ Entity を親として参照する。
     * 
     * GC のタイミングで、parent がおらず、UniqueEntity や Map に出現している Entity のリストに存在しない Entity は削除される。
     */
    _parentEntityId: LObjectId = { index: 0, key: 0 };

    id(): LObjectId {
        return this._id;
    }

    parentid(): LObjectId {
        return this._parentEntityId;
    }

    hasParent(): boolean {
        return this._parentEntityId.index > 0;
    }

    setParent(parent: LObject | undefined): void {
        if (parent) {
            assert(!this.hasParent());

            const parentId = parent.id();
            assert(parentId.index > 0);     // ID を持たない親は設定できない
            this._parentEntityId = parentId;
        }
        else {
            this._parentEntityId.index = 0;
            this._parentEntityId.key = 0;
        }
    }
}

