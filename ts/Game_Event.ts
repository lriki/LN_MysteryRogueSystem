import { RMMZEventEntityMetadata, RMMZHelper } from "./rmmz/RMMZHelper";

declare global {
    interface Game_Event {
        _entityMetadata: RMMZEventEntityMetadata | undefined;

        isREEntity(): boolean;
    }
}

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

    this._entityMetadata = RMMZHelper.readEntityMetadata(this);
}

Game_Event.prototype.isREEntity = function(): boolean {
    return !!this._entityMetadata;
}
