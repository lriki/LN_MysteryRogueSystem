import { RE_Game_Entity } from "./REGame_Entity";
import { assert } from "ts/Common";

/**
 * 1ゲーム内に1インスタンス存在する。
 */
export class RE_Game_World
{
    _entities: (RE_Game_Entity | undefined)[] = [];

    _addEntity(entity: RE_Game_Entity): void {
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

