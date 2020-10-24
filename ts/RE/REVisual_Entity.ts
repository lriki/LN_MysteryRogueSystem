import { REData, REData_Sequel } from "./REData";
import { REGame_Entity } from "./REGame_Entity";

/**
 */
export class REVisual_Entity
{
    private _entity: REGame_Entity; // EntityVisual が存在する間、Entity は必ず存在していると考えてよい

    constructor(entity: REGame_Entity) {
        this._entity = entity;
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    _update() {

    }
}

