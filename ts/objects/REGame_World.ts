import { REGame_Entity } from "./REGame_Entity";
import { assert } from "../Common";
import { REGame } from "./REGame";
import { Random } from "ts/math/Random";
import { EntityId, eqaulsEntityId } from "ts/system/EntityId";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class RE_Game_World
{
    private _entities: (REGame_Entity | undefined)[] = [];
    private _random: Random = new Random(Math.floor(Math.random() * 65535) + 1);

    constructor() {
        const e = this.spawnEntity();  // [0] dummy entity
        e._name = "null";
    }

    entity(id: EntityId): REGame_Entity {
        const e = this._entities[id.index];
        if (e && e.id().key == id.key)
            return e;
        else
            throw new Error("Invalid entity. id:" + id);
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
    spawnEntity(): REGame_Entity {
        const entity = new REGame_Entity();
        this._registerEntity(entity);
        return entity;
    }

    private _registerEntity(entity: REGame_Entity): void {
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._entities.findIndex((x, i) => i > 0 && x == undefined);
        if (index < 0) {
            entity._id.index = this._entities.length;
            entity._id.key = this._random.nextInt();
            this._entities.push(entity);
        }
        else {
            entity._id.index = index;
            entity._id.key = this._random.nextInt();
            this._entities[index] = entity;
        }
    }

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
    _transferEntity(entity: REGame_Entity, floorId: number, x: number, y: number): boolean {
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
        for (let i = 0; i < this._entities.length; i++) {
            const entity = this._entities[i];
            if (entity && entity.isDestroyed()) {

                if (entity.floorId == REGame.map.floorId()) {
                    REGame.map._removeEntity(entity);
                }

                REGame.scheduler.invalidateEntity(entity);

                this._entities[i] = undefined;

                if (eqaulsEntityId(REGame.camera.focusedEntityId(), entity.id())) {
                    REGame.camera.clearFocus();
                }
            }
        }
    }

    // 現在の Map(Floor) に存在するべき Entity を、Map に登場 (追加) させる
    enterEntitiesToCurrentMap() {
        for (let i = 1; i < this._entities.length; i++) {
            const entity = this._entities[i];
            if (entity) {
                if (REGame.map.floorId() == entity.floorId && !entity.isTile()) {
                    REGame.map._reappearEntity(entity);
                }
            }
        }
    }
}

