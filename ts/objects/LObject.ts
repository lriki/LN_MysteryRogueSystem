import { assert } from "ts/Common";
import { LEntity } from "./LEntity";
import { REGame } from "./REGame";


export class LEntityId {
    private readonly _index: number;  // 0 is Invalid (dummy entity)
    private readonly _key: number;

    constructor(index: number, key: number) {
        this._index = index;
        this._key = key;
    }

    public index2(): number {
        return this._index;
    }

    public key2(): number {
        return this._key;
    }

    public isEmpty(): boolean {
        return this._index == 0 && this._key == 0;
    }

    public hasAny(): boolean {
        return this._index > 0 && this._key != 0;
    }

    public equals(other: LEntityId): boolean {
        return this._index == other._index && this._key == other._key;
    }

    public clone(): LEntityId {
        return new LEntityId(this._index, this._key);
    }

    public static makeEmpty(): LEntityId {
        return new LEntityId(0, 0);
    }
}




/*
export interface LObjectId {
    readonly index: number;  // 0 is Invalid (dummy entity)
    readonly key: number;
}
*/
export type LObjectId = LEntityId;
export type LBehaviorId = LEntityId;

export enum LObjectType {
    Entity,
    State,
    Ability,
    Behavior,
    Map,
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
    private _objectId: LObjectId = LEntityId.makeEmpty();
    private _destroyed: boolean = false;
    private _parentObjectId: LObjectId = LEntityId.makeEmpty();
    
    protected constructor(objectType: LObjectType) {
        this._objectType = objectType;
    }

    public objectType(): LObjectType {
        return this._objectType;
    }

    __objectId(): LObjectId {
        return this._objectId;
    }

    public hasId(): boolean {
        return this._objectId.hasAny();
    }

    public _setObjectId(id: LObjectId): void  {
        assert(id.hasAny());   // 無効IDの設定は禁止。リセットしたいときは _clearObjectId() を使うこと。
        assert(!this.hasId());  // 再設定禁止。
        this._objectId = id;
    }

    public _clearObjectId(): void {
        this._objectId = LEntityId.makeEmpty();
    }

    public isUnique(): boolean {
        return false;
    }

    public hasParent(): boolean {
        return this._parentObjectId.hasAny();
    }

    public isGCReady(): boolean {
        // Unique Entity は削除されない
        if (this.isUnique()) return false;
        // 親から参照されているものは削除されない (明示的に除外されなければならない)
        if (this.hasParent()) return false;
        
        return true;
    }

    /**
     * 親 Object
     * 
     * GC のタイミングで、owner がおらず、UniqueEntity や Map に出現している Entity のリストに存在しない Entity は削除される。
     */
    public parentObjectId(): LObjectId {
        return this._parentObjectId;
    }
    
    public parentObject(): LObject {
        return REGame.world.object(this._parentObjectId);
    }

    public parentAs<T extends LObject>(ctor: { new(...args: any[]): T }): T | undefined {
        if (!this.hasParent()) return undefined;
        const obj = this.parentObject();
        if (obj instanceof ctor) {
            return obj as T;
        }
        else {
            return undefined;
        }
    }

    public setParent(parent: LObject): void {
        if (this.hasParent()) {
            console.error("this", this);
            console.error("current parent", this.parentObject());
            console.error("new parent", parent);
            assert(!this.hasParent());
        }

        const ownerId = parent.__objectId();
        assert(ownerId.hasAny());     // ID を持たない親は設定できない
        this._parentObjectId = ownerId;
    }

    public clearParent(): void {
        this._parentObjectId = LEntityId.makeEmpty();
    }

    public removeFromParent(): void {
        if (this.hasParent()) {
            this.parentObject().onRemoveChild(this);
            assert(this._parentObjectId.isEmpty());
        }
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
        this.removeFromParent();
        this._destroyed = true;
    }

    public onFinalize(): void {

    }
    

    public behaviorIds(): LBehaviorId[] {
        return [];
    }

    protected onRemoveChild(obj: LObject): void {
        throw new Error("Unreachable.");
    }
}
