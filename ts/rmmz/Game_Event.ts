import { RMMZEventEntityMetadata, SRmmzHelpers } from "ts/system/SRmmzHelpers";
import { RMMZHelper } from "./RMMZHelper";

declare global {
    interface Game_Event {
        _entityMetadata: RMMZEventEntityMetadata | undefined;

        isREEntity(): boolean;
    }
}

/*
const _Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId: number, eventId: number) {
    if (mapId > 0) {
        _Game_Event_initialize.call(this, mapId, eventId);
    }
    else {
        console.log("_Game_Event_initialize");
        Game_Character.prototype.initialize.call(this);
    }
};
*/

var _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
}

var _Game_Event_isTriggerIn = Game_Event.prototype.isTriggerIn;
Game_Event.prototype.isTriggerIn = function(triggers) {
    if (this.isREEntity())
        return false;   // イベント実行タイミングはすべて RE システム無いから決められる
    else
        return triggers.includes(this._trigger);
}

var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);

    this._entityMetadata = SRmmzHelpers.readEntityMetadata(this);
}

Game_Event.prototype.isREEntity = function(): boolean {
    return !!this._entityMetadata;
}

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    if ($gameMap.isRESystemMap()) {
        
    }
    else {
        _Game_Event_update.call(this);
    }
}
