import { REData, REData_Sequel } from "./REData";
import { REGame_Entity } from "./REGame_Entity";

/**
 */
export class REVisual_Entity
{
    private _entity: REGame_Entity; // EntityVisual が存在する間、Entity は必ず存在していると考えてよい
    private _rmmzEventId: number;
    private _spriteIndex: number;   // Spriteset_Map._characterSprites の index

    constructor(entity: REGame_Entity, rmmzEventId: number) {
        this._entity = entity;
        this._rmmzEventId = rmmzEventId;
        this._spriteIndex = -1;
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    _setSpriteIndex(value: number) {
        this._spriteIndex = value;
    }

    _update() {

    }
}

