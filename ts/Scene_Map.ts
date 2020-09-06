import { RE_DataManager } from "./RE/RE_DataManager";

var _Scene_Map_isReady = Scene_Map.prototype.isReady;
Scene_Map.prototype.isReady = function() {
    if (RE_DataManager.landMapDataLoading) {
        if (DataManager.isMapLoaded()) {
            // Land 定義マップの読み込みがすべて終わった
            
            // 元の遷移先マップをバックアップ (Land 定義マップとして使う)
            RE_DataManager._dataLandDefinitionMap = $dataMap

            // 固定マップを読み込む
            DataManager.loadMapData(1);

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
