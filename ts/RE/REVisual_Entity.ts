import { Vector2 } from "ts/math/Vector2";
import { REData, REData_Sequel } from "./REData";
import { REGame_Entity } from "./REGame_Entity";
import { REVisual } from "./REVisual";

/**
 */
export class REVisual_Entity
{
    private _entity: REGame_Entity; // EntityVisual が存在する間、Entity は必ず存在していると考えてよい
    private _rmmzEventId: number;
    private _spriteIndex: number;   // Spriteset_Map._characterSprites の index
    private _sequelContext: REVisualSequelContext;

    // 単位は Block 座標と等しい。px 単位ではない点に注意。
    // アニメーションを伴う場合、少数を扱うこともある。
    // 原点は Block の中央とする。
    private _position: Vector2;

    constructor(entity: REGame_Entity, rmmzEventId: number) {
        this._entity = entity;
        this._rmmzEventId = rmmzEventId;
        this._spriteIndex = -1;
        this._sequelContext = new REVisualSequelContext();
        this._position = new Vector2(0, 0);
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    sequelContext(): REVisualSequelContext {
        return this._sequelContext;
    }

    _setSpriteIndex(value: number) {
        this._spriteIndex = value;
    }

    _update() {

        if (this._rmmzEventId > 0) {
            const tileSize = REVisual.manager.tileSize();
            const event = $gameMap.event(this._rmmzEventId);

            event._realX = (this._position.x * tileSize.x) + (tileSize.x  / 2);
            event._realY = (this._position.y * tileSize.y) + (tileSize.y  / 2);
        }
    }
}

