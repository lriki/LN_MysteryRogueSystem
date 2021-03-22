import { LEntity } from "./LEntity";
import { assert } from "../Common";
import { REGame } from "./REGame";
import { LRandom } from "ts/objects/LRandom";
import { LEntityId, eqaulsEntityId, LObject, LObjectType, LObjectId } from "./LObject";
import { LBehavior, LBehaviorId } from "./behaviors/LBehavior";
import { TilingSprite } from "pixi.js";
import { LAbility, LAbilityId } from "./abilities/LAbility";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class LWorld
{
    //private _entities: (LEntity | undefined)[] = [];
    private _objects: (LObject | undefined)[] = [];
    private _behaviors: (LBehavior | undefined)[] = [];
    private _random: LRandom = new LRandom(Math.floor(Math.random() * 65535) + 1);

    constructor() {
        this._objects = [undefined];   // [0] is dummy
        this._behaviors = [undefined];   // [0] is dummy
    }
    
    object(id: LObjectId): LObject {
        const e = this._objects[id.index];
        if (e && e.__objectId().key == id.key) {
            return e as LEntity;
        }
        else {
            if (!e) {
                throw new Error(`Unregisterd entity. (id: [${id.index}, ${id.key}])`);
            }
            else {
                throw new Error(`Destroyed entity. (id: [${id.index}, ${id.key}], actualy:[${e.__objectId().index}, ${e.__objectId().key}])`);
            }
        }
    }

    entity(id: LEntityId): LEntity {
        const e = this.object(id);
        if (e.objectType() == LObjectType.Entity)
            return e as LEntity;
        else
            throw new Error(`Invalid entity type. (id: [${id.index}, ${id.key}])`);
    }

    behavior(id: LBehaviorId): LBehavior {
        const e = this._behaviors[id.index];
        if (e && e.id().key == id.key)
            return e;
        else {
            if (!e) {
                throw new Error(`Unregisterd behavior. (id: [${id.index}, ${id.key}])`);
            }
            else {
                throw new Error(`Destroyed behavior. (id: [${id.index}, ${id.key}])`);
            }
        }
    }

    ability(id: LAbilityId): LAbility {
        const e = this.object(id);
        if (e.objectType() == LObjectType.Ability)
            return e as LAbility;
        else
            throw new Error(`Invalid entity type. (id: [${id.index}, ${id.key}])`);
    }

    random(): LRandom {
        return this._random;
    }

    /**
     * 新しい Entity を World 内に生成する。
     * 
     * 生成された Entity はいずれの Floor にも属さない状態となっている。
     * 出現させるには transfarEntity() を呼び出す必要がある。
     */
    spawnEntity(): LEntity {
        const entity = new LEntity();
        this._registerObject(entity);
        return entity;
    }

    public _registerObject(obj: LObject): void {
        assert(!obj.hasId());
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._objects.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            obj._setObjectId({ index: this._objects.length, key : this._random.nextInt() });
            this._objects.push(obj);
        }
        else {
            obj._setObjectId({ index: index, key : this._random.nextInt() });
            this._objects[index] = obj;
        }
    }

    _registerBehavior(behavior: LBehavior) {
        assert(!behavior.hasId());
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._behaviors.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            behavior._setObjectId({ index: this._behaviors.length, key : this._random.nextInt() });
            this._behaviors.push(behavior);
        }
        else {
            behavior._setObjectId({ index: index, key : this._random.nextInt() });
            this._behaviors[index] = behavior;
        }
    }

    _unregisterBehavior(behavior: LBehavior) {
        this._behaviors[behavior.id().index] = undefined;
        behavior._clearObjectId();
    }

    /*
    newBehavior<T>(ctor: { new(...args: any[]): T }): T {

        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._behaviors.findIndex((x, i) => i > 0 && x == undefined);
        const newId: LBehaviorId = {
            index: (index < 0) ? this._behaviors.length : index,
            key : this._random.nextInt(),
        }

        const behavior = new T(newId);
        this._behaviors[newId.index] = behavior;
    }
    */
    /**
     * Entity を指定した位置に移動する。
     * - 現在表示中のマップへ移動した場合、そのマップへ登場する。
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * - 表示中以外のマップ(固定マップ)へ移動した場合、
     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。
     * - 表示中以外のマップ(ランダムマップ)へ移動した場合、
     *   - 座標は常に 0,0 へ移動し、成功する。ほかの Entity とは重なるが、ランダムマップ生成時に再配置される。
     * 
     * 直ちに座標を変更するため、コマンドチェーン実行内からの呼び出しは禁止。
     * CommandContext.postTransferFloor() を使うこと。
     */
    _transferEntity(entity: LEntity, floorId: number, x: number, y: number): boolean {
        if (REGame.map.isValid() && REGame.map.floorId() != floorId && REGame.map.floorId() == entity.floorId) {
            // 現在マップからの離脱
            REGame.map._removeEntity(entity);
        }

        if (REGame.map.floorId() == floorId) {
            // 現在表示中のマップへの移動
            entity.floorId = floorId;
            REGame.map.locateEntity(entity, x, y);
            REGame.map._addEntityInternal(entity);
        }
        else {
            entity.floorId = floorId;
            entity.x = x;
            entity.y = y;
        }

        // Camera が注視している Entity が別マップへ移動したら、マップ遷移
        if (eqaulsEntityId(REGame.camera.focusedEntityId(), entity.entityId()) &&
            REGame.map.floorId() != entity.floorId) {
            REGame.camera.reserveFloorTransferToFocusedEntity();
        }

        return true;
    }

    public _removeDestroyedObjects(): void {
        for (let i = 1; i < this._objects.length; i++) {
            const obj = this._objects[i];
            if (obj) {
                if (!obj.isUnique() && !obj.hasOwner()) {
                    // Unique Entity 以外で、いずれからの参照もない Entity は削除する
                    obj.destroy();
                }

                if (obj.isDestroyed()) {

                    obj.onFinalize();
                    this._objects[i] = undefined;
    
                    if (eqaulsEntityId(REGame.camera.focusedEntityId(), obj.__objectId())) {
                        REGame.camera.clearFocus();
                    }
                }
            }

        }
    }

    // 現在の Map(Floor) に存在するべき Entity を、Map に登場 (追加) させる
    enterEntitiesToCurrentMap() {
        const player = REGame.camera.focusedEntity();
        assert(player)

        for (let i = 1; i < this._objects.length; i++) {
            const obj = this._objects[i];
            if (obj && obj.objectType() == LObjectType.Entity) {
                const entity = obj as LEntity;
                // enterEntitiesToCurrentMap() が呼ばれる前に Map の setup が行われている。
                // 固定マップの場合は既にいくつか Entity が追加されていることがあるので、
                // それはここでは追加しない。
                const isNoEnterd = !entity.hasOwner();

                if (REGame.map.floorId() == entity.floorId && isNoEnterd) {
                    REGame.map._reappearEntity(entity);
                }
            }
        }
    }
}

