import { REGame_Entity } from "./REGame_Entity";
import { assert } from "../Common";
import { REGame } from "./REGame";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class RE_Game_World
{
    private _entities: (REGame_Entity | undefined)[] = [];

    entity(id: number): REGame_Entity | undefined {
        return this._entities[id];
    }

    _addEntity(entity: REGame_Entity): void {
        // TODO: 空き場所を愚直に線形探索。
        // 大量の Entity を扱うようになったら最適化する。
        const index = this._entities.findIndex(x => x == undefined);
        if (index < 0) {
            entity._id = this._entities.length;
            this._entities.push(entity);
        }
        else {
            entity._id = index;
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
     */
    _transfarEntity(entity: REGame_Entity, floorId: number, x: number, y: number): boolean {
        if (REGame.map.floorId() == floorId) {
            // 現在表示中のマップへの移動
            REGame.map._addEntity(entity);
            REGame.map._locateEntityFuzzy(entity, x, y);
            return true;    // TODO: 移動できないときの処理
        }
        else if (REGame.map.isFixedMap()) {
            // 非表示の固定マップへの移動
            assert(0);
            return false;
        }
        else if (REGame.map.isRandomMap()) {
            // 非表示のランダムマップへの移動
            assert(0);
            return false;
        }
        else {
            assert(0);
            return false;
        }
    }

    update(): void {
        this._removeDestroyesEntities();
    }

    _removeDestroyesEntities(): void {
        for (let i = 0; i < this._entities.length; i++) {
            const entity = this._entities[i];
            if (entity && entity.isDestroyed()) {
                this._entities[i] = undefined;
            }
        }
    }
}

