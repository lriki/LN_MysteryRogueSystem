import { REData, REData_Sequel } from "./REData";
import { REGame_Entity } from "./REGame_Entity";

/**
 * Sequel
 * 
 * 
 */
export class REGame_Sequel
{
    private _entity: REGame_Entity;
    private _sequelId: number;

    constructor(entity: REGame_Entity, sequelId: number) {
        this._entity = entity;
        this._sequelId = sequelId;
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    data(): REData_Sequel {
        return REData.sequels[this._sequelId];
    }
}

