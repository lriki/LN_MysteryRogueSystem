import { assert } from "./Common";
import { REDataManager } from "./data/REDataManager";
import { REEntityVisualSet } from "./visual/REEntityVisualSet";
import { REVisual } from "./visual/REVisual";

declare global {
    interface Scene_Map {
        //_entityVisualSet: REEntityVisualSet | undefined;
    }
}

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

var _Scene_Map_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function() {
    _Scene_Map_create.call(this);

    console.log("Scene_Map.prototype.create");

    REVisual.initialize();
}

var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    // ベースの createDisplayObjects() では update() 一度呼ばれるため、先にインスタンスを作っておく
    assert(!REVisual.entityVisualSet);
    REVisual.entityVisualSet = new REEntityVisualSet();

    _Scene_Map_createDisplayObjects.call(this);
};

var _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);

    console.log("Scene_Map.prototype.terminate");

    if (REVisual.entityVisualSet) {
        REVisual.entityVisualSet.ternimate();
        REVisual.entityVisualSet = undefined;
    }

    REVisual.finalize();
}

var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);

    REVisual.entityVisualSet?.update();
}
