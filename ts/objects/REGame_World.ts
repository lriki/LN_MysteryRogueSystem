import { LEntity } from "./LEntity";
import { assert } from "../Common";
import { REGame } from "./REGame";
import { Random } from "ts/math/Random";
import { LEntityId, eqaulsEntityId } from "./LObject";
import { LBehavior, LBehaviorId } from "./behaviors/LBehavior";
import { TilingSprite } from "pixi.js";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class RE_Game_World
{
    private _entities: (LEntity | undefined)[] = [];
    private _behaviors: (LBehavior | undefined)[] = [];
    private _random: Random = new Random(Math.floor(Math.random() * 65535) + 1);

    constructor() {
        this._entities = [undefined];   // [0] is dummy
        this._behaviors = [undefined];   // [0] is dummy
    }

    entity(id: LEntityId): LEntity {
        const e = this._entities[id.index];
        if (e && e.id().key == id.key)
            return e;
        else {
            if (!e) {
                throw new Error(`Unregisterd entity. (id: [${id.index}, ${id.key}])`);
            }
            else {
                throw new Error(`Destroyed entity. (id: [${id.index}, ${id.key}])`);
            }
        }
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

    random(): Random {
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
        this._registerEntity(entity);
        return entity;
    }

    private _registerEntity(entity: LEntity): void {
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._entities.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            entity._setId({ index: this._entities.length, key : this._random.nextInt() });
            this._entities.push(entity);
        }
        else {
            entity._setId({ index: index, key : this._random.nextInt() });
            this._entities[index] = entity;
        }
    }

    _registerBehavior(behavior: LBehavior) {
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._behaviors.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            behavior._setId({ index: this._behaviors.length, key : this._random.nextInt() });
            this._behaviors.push(behavior);
        }
        else {
            behavior._setId({ index: index, key : this._random.nextInt() });
            this._behaviors[index] = behavior;
        }
    }

    _unregisterBehavior(behavior: LBehavior) {
        this._behaviors[behavior.id().index] = undefined;
        behavior._setId({ index: 0, key : 0 });
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
        if (eqaulsEntityId(REGame.camera.focusedEntityId(), entity.id()) &&
            REGame.map.floorId() != entity.floorId) {
            REGame.camera.reserveFloorTransferToFocusedEntity();
        }

        return true;
    }

    _removeDestroyesEntities(): void {
        for (let i = 1; i < this._entities.length; i++) {
            const entity = this._entities[i];
            if (entity) {
                if (!entity.isUnique() && !entity.hasParent()) {
                    // Unique Entity 以外で、いずれからの参照もない Entity は削除する
                    entity.destroy();
                }

                if (entity.isDestroyed()) {

                    if (entity.floorId == REGame.map.floorId()) {
                        REGame.map._removeEntity(entity);
                    }
    
                    REGame.scheduler.invalidateEntity(entity);
    
                    entity._finalize();
                    this._entities[i] = undefined;
    
                    if (eqaulsEntityId(REGame.camera.focusedEntityId(), entity.id())) {
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

        for (let i = 1; i < this._entities.length; i++) {
            const entity = this._entities[i];
            if (entity) {
                // enterEntitiesToCurrentMap() が呼ばれる前に Map の setup が行われている。
                // 固定マップの場合は既にいくつか Entity が追加されていることがあるので、
                // それはここでは追加しない。
                const isNoEnterd = !entity.hasParent();

                if (REGame.map.floorId() == entity.floorId && !entity.isTile() && isNoEnterd) {
                    REGame.map._reappearEntity(entity);
                }
            }
        }
    }
}

