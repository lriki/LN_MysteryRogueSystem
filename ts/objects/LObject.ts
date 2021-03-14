import { assert } from "ts/Common";


export interface LEntityId {
    readonly index: number;  // 0 is Invalid (dummy entity)
    readonly key: number;
}

export const LEntityId_Empty: LEntityId = {
    index: 0,
    key: 0,
};

export function isEmptyEntityId(a: LEntityId): boolean {
    return a.index == 0 && a.key == 0;
}

export function eqaulsEntityId(a: LEntityId, b: LEntityId): boolean {
    return a.index == b.index && a.key == b.key;
}

export function cloneEntityId(a: LEntityId): LEntityId {
    return {
        index: a.index,
        key: a.key,
    };
}


export enum LObjectType {
    Entity,
    State,
    Ability,
}

/**
 * Behavior を保持するクラスのベースクラス
 * 
 * [2021/3/14]
 * ----------
 * 現時点では、LEntity, LState, LAbility のベースクラスとなる。
 * 
 */
export class LObject {
    private _objectType: LObjectType;

    protected constructor(objectType: LObjectType) {
        this._objectType = objectType;
    }

    public objectType(): LObjectType {
        return this._objectType;
    }
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

/*
 export class LObject {
    _id: LEntityId = { index: 0, key: 0 };
    
    // 親 Entity。
    // 例えば Inventory に入っている Entity は、その Inventory を持つ Entity を親として参照する。
    // 
    // GC のタイミングで、parent がおらず、UniqueEntity や Map に出現している Entity のリストに存在しない Entity は削除される。
    _parentEntityId: LEntityId = { index: 0, key: 0 };

    id(): LEntityId {
        return this._id;
    }

    parentid(): LEntityId {
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

*/
