import { DHelpers, RmmzREEventMetadata } from "ts/re/data/DHelper";
import { REGame } from "ts/re/objects/REGame";
import { SRmmzHelpers } from "ts/re/system/SRmmzHelpers";

declare global {
    interface Game_Event {
        //_entityData: DEntitySpawner2 | undefined;
        _isREEntity: boolean;
        _reEventData: RmmzREEventMetadata | undefined;

        isREEntity(): boolean;
        isREEvent(): boolean;
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

    this._isREEntity = !!SRmmzHelpers.readEntityMetadata(this);
    this._reEventData = (this._pageIndex >= 0) ? DHelpers.readREEventMetadataFromPage(this.page()) : undefined;
}

Game_Event.prototype.isREEntity = function(): boolean {
    return this._isREEntity;
}

Game_Event.prototype.isREEvent = function() {
    return true;
}

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    if (REGame.map.floorId().isEntitySystemMap()) {
        
    }
    else {
        _Game_Event_update.call(this);
    }
}
