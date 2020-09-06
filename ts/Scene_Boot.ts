import { RE_DataManager } from "./RE_DataManager";


var _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
    _Scene_Boot_onDatabaseLoaded.call(this);
    RE_DataManager.loadData();
    console.log("Scene_Boot initialized.");
}

