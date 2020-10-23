import { REData, REData_Sequel } from "./REData";
import { RE_Game_Entity } from "./REGame_Entity";

/**
 * Sequel
 * 
 * 
 */
export class REGame_Sequel
{
    private _entity: RE_Game_Entity;
    private _sequelId: number;

    constructor(entity: RE_Game_Entity, sequelId: number) {
        this._entity = entity;
        this._sequelId = sequelId;
    }

    entity(): RE_Game_Entity {
        return this._entity;
    }

    data(): REData_Sequel {
        return REData.sequels[this._sequelId];
    }
}

