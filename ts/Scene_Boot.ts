import { REDataManager } from "./RE/REDataManager";


var _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
    _Scene_Boot_onDatabaseLoaded.call(this);
    REDataManager.loadData();
}

