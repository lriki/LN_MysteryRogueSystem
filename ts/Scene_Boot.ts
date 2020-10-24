import { REDataManager } from "./RE/REDataManager";

var _Scene_Boot_isReady = Scene_Boot.prototype.isReady;
Scene_Boot.prototype.isReady = function() {
    // ベースの isReady の中から onDatabaseLoaded が呼び出される
    const result = _Scene_Boot_isReady.call(this);

    if (!window["RE_databaseMap"]) {
        return false;
    }
    else {
        // Database マップの読み込みが完了
        return result;
    }
}

var _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
    _Scene_Boot_onDatabaseLoaded.call(this);
    REDataManager.loadData();

    // Database マップ読み込み開始
    const filename = `Map${REDataManager.databaseMapId.padZero(3)}.json`;
    DataManager.loadDataFile("RE_databaseMap", filename);
}
