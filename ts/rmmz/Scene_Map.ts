import { assert } from "../Common";
import { REData, REFloorMapKind } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { RMMZIntegration } from "./RMMZIntegration";
import { RESystem } from "../system/RESystem";
import { REEntityVisualSet } from "../visual/REEntityVisualSet";
import { REVisual } from "../visual/REVisual";
import { Game_REPrefabEvent } from "./PrefabEvent";
import { VDirectionArrow } from "ts/visual/VDirectionArrow";

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
            
            if (REData.floors[REDataManager.loadingMapId].mapKind == REFloorMapKind.FixedMap) {
                // イベントなどから固定マップへ直接遷移した場合はここに来る。
                // この場合はベースの DataManger.loadMapData によってマップデータロード済みなので、特に何かする必要はない。
                REDataManager.loadedFloorMapId = REDataManager.loadingMapId;
                REDataManager.landMapDataLoading = false;

                // これを呼んでおかないと、コアスクリプト内で必要なオブジェクトが作成されない。
                return _Scene_Map_isReady.call(this);
            }
            else {
                throw new Error("Not implemented.");
                // Reload. まだ読み込み完了していない扱いにする
                return false;
            }

            // 固定マップを読み込む
            //DataManager.loadMapData(1); // TODO: id

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

// マップ切り替えのたびに呼び出される。
// Scene_Map.updateTransferPlayer() でマップ遷移を検出すると、
// goto(Scene_Map) で別インスタンスの Scene_Map へ遷移する。
var _Scene_Map_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function() {
    _Scene_Map_create.call(this);

    const aa =  Game_REPrefabEvent.prototype;
    console.log("prototype", aa);
/*
    console.log("window", window);
    //new Game_REPrefabEvent();
    const aa = (window as any)["PrefabEvent"];
    console.log("PrefabEvent", aa);
*/
}

var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {

    // ベースの createDisplayObjects() では update() が一度呼ばれるため、先にインスタンスを作っておく
    assert(!REVisual.entityVisualSet);
    REVisual.entityVisualSet = new REEntityVisualSet();

    _Scene_Map_createDisplayObjects.call(this);
    
    // REVisual の中で Window を作りたいが、ベースの createWindowLayer() を先に実行しておく必要がある。
    // その後 createWindows() を呼び出す。
    REVisual.onSceneChanged(this);
};

var _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);

    if (REVisual.entityVisualSet) {
        REVisual.entityVisualSet.ternimate();
        REVisual.entityVisualSet = undefined;
    }
}

var _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    REVisual.update();
}

// RE Map 内では RMMZ 通常のメニューを禁止する
var _Scene_Map_isMenuCalled = Scene_Map.prototype.isMenuCalled;
Scene_Map.prototype.isMenuCalled = function() {
    if ($gameMap.isRESystemMap())
        return false;
    else
        return _Scene_Map_isMenuCalled.call(this);
};
