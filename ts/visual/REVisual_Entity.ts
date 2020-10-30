import { Vector2 } from "ts/math/Vector2";
import { REVisualSequelContext } from "ts/visual/REVisualSequelContext";
import { REData, REData_Sequel } from "../data/REData";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REVisual } from "./REVisual";

/**
 * Entity の「見た目」を表現するためのクラス。
 * 
 * RMMZ 向けのこのクラスの実装では、直接 Sprite を出したりするわけではない点に注意。
 * Mnager からのインスタンス生成と同時に、動的に Game_Event が生成され、このクラスはその Game_Event を操作する。
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
        this._position = new Vector2(entity.x, entity.y);
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    resetPosition() {
        this._position.x = this._entity.x;
        this._position.y = this._entity.y;
    }

    sequelContext(): REVisualSequelContext {
        return this._sequelContext;
    }

    _setSpriteIndex(value: number) {
        this._spriteIndex = value;
    }

    _update() {
        this._sequelContext._update(this);
        
        if (this._rmmzEventId > 0) {
            const tileSize = REVisual.manager.tileSize();
            const event = $gameMap.event(this._rmmzEventId);

            // 姿勢同期
            event._x = this._position.x;
            event._y = this._position.y;
            event._realX = this._position.x;//(this._position.x * tileSize.x) + (tileSize.x  / 2);
            event._realY = this._position.y;//(this._position.y * tileSize.y) + (tileSize.y  / 2);
            event.setDirection(this._entity.dir);
        }
        
    }
}

