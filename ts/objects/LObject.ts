import { assert } from "ts/Common";
import { REGame } from "./REGame";


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






/*
export interface LObjectId {
    readonly index: number;  // 0 is Invalid (dummy entity)
    readonly key: number;
}
*/
export type LObjectId = LEntityId;

export enum LObjectType {
    Entity,
    State,
    Ability,
    Behavior,
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
    private readonly _objectType: LObjectType;
    private _objectId: LObjectId = { index: 0, key: 0 };
    private _destroyed: boolean = false;
    private _ownerObjectId: LObjectId = { index: 0, key: 0 };
    
    protected constructor(objectType: LObjectType) {
        this._objectType = objectType;
    }

    public objectType(): LObjectType {
        return this._objectType;
    }

    public objectId(): LObjectId {
        return this._objectId;
    }

    public hasId(): boolean {
        return this._objectId.index > 0 && this._objectId.key != 0;
    }

    public _setObjectId(id: LObjectId): void  {
        assert(id.index > 0);   // 無効IDの設定は禁止。リセットしたいときは _clearObjectId() を使うこと。
        assert(!this.hasId());  // 再設定禁止。
        this._objectId = id;
    }

    public _clearObjectId(): void {
        this._objectId = { index: 0, key: 0 };
    }

    public isUnique(): boolean {
        return false;
    }

    public hasOwner(): boolean {
        return this._ownerObjectId.index > 0;
    }

    /**
     * 親 Entity。
     * 例えば Inventory に入っている Entity は、その Inventory を持つ Entity を親として参照する。
     * 
     * GC のタイミングで、owner がおらず、UniqueEntity や Map に出現している Entity のリストに存在しない Entity は削除される。
     */
    public ownerObjectId(): LObjectId {
        return this._ownerObjectId;
    }
    
    public ownerObject(): LObject {
        return REGame.world.object(this._ownerObjectId);
    }

    public ownerAs<T extends LObject>(ctor: { new(...args: any[]): T }): T | undefined {
        if (!this.hasOwner()) return undefined;
        const obj = this.ownerObject();
        if (obj instanceof ctor) {
            return obj as T;
        }
        else {
            return undefined;
        }
    }

    public setOwner(owner: LObject): void {
        assert(!this.hasOwner());
        const ownerId = owner.objectId();
        assert(ownerId.index > 0);     // ID を持たない親は設定できない
        this._ownerObjectId = ownerId;
    }

    public clearOwner(): void {
        this._ownerObjectId = { index: 0, key: 0 };
    }
    
    /** destroy が要求されているか */
    public isDestroyed(): boolean {
        return this._destroyed;
    }
    
    /**
     * Behavior から Entity を削除する場合、CommandContext.postDestroy() を使用してください。
     */
    public destroy(): void {
        assert(!this.isUnique());
        this._destroyed = true;
    }

    public onFinalize(): void {

    }
}
