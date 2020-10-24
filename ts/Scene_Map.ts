import { REDataManager } from "./RE/REDataManager";
import { REVisual } from "./RE/REVisual";

var _Scene_Map_isReady = Scene_Map.prototype.isReady;
Scene_Map.prototype.isReady = function() {
    if (REDataManager.landMapDataLoading) {
        if (DataManager.isMapLoaded()) {
            // Land 定義マップの読み込みがすべて終わった
            
            // 元の遷移先マップをバックアップ (Land 定義マップとして使う)
            REDataManager._dataLandDefinitionMap = $dataMap

            // 固定マップを読み込む
            DataManager.loadMapData(1); // TODO: id

            // Reload. まだ読み込み完了していない扱いにする
            return false;
        }
        else {
            // Land 定義マップの読み込み中
            return false;
        }
    }
    else {
        return _Scene_Map_isReady.call(this);
    }
}

var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    return _Scene_Map_onMapLoaded.call(this);
}

var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    _Scene_Map_createDisplayObjects.call(this);

    REVisual.initialize();
};

var _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Battle.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);

    REVisual.finalize();
}
