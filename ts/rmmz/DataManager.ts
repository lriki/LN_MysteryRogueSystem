import { REDataManager } from "../data/REDataManager";
import { REGame } from "../objects/REGame";
import { SGameManager } from "../system/SGameManager";
import { REData, REFloorMapKind } from "../data/REData";
import { assert } from "../Common";

/*
 [2020/11/2] マップ読み込みメモ
 ----------
 制約: RMMZ は Scene_Map に遷移するたびに、マップデータのロードが行われる。
       goto, call 関係なしで、メニューや先頭から戻ってきたときもロードされる。

 ### 固定マップ
 倉庫・訓練場・ボス部屋・チュートリアルマップなどが該当する。
 当初は Land から独立したマップとして考えていたが、ひとまず他とローディングのフローを合わせるため、
 Land に属することを必須としてみる。

 例えば通常の RMMZ のマップから倉庫マップに移動したいときは、通常のマップ移動とは異なる。
 「倉庫LandのF1を倉庫マップとする」といった設定を Land マップで行い、
 イベントからはスクリプトコマンドなどで「倉庫LandのF1へ移動する」

 ### シャッフルダンジョンマップ

 ### ランダムマップ
 イベントや階段などのマップ遷移は、[Land 情報マップID, フロア番号] を与えて遷移する。
 その後、対応するテンプレートマップへ遷移する。
 実際に表示される RMMZ のマップは、このテンプレートマップとなる。

 > このようにして、RE システムがアクティブな時のマップは、どんなパターンであれ
 > 必ず "Floor" 扱いされたマップがロードされた状態となる。
 > こうしておかないとマップロード処理が非常に煩雑になる。


 ### 固定及びシャッフルマップのイベントについて
 これらのマップには RMMZ のイベントを配置することができる。
 特にボス部屋で演出のためにイベントを起動する要求は非常に多い。
 またボスの初期位置を決めるためにも使う。

 これらのイベントはマップへ遷移したあと、そのマップのイベントから Entity を作ることになるが、
 RMMZ の頻繁なマップロードのタイミングに対応するため対策が必要となる。
 - REMap の生成元となった MapId を覚えておく。
 - マップ遷移が行われたとき、↑で覚えている ID と同じマップであれば Entity を生成しない。（以前のをそのまま使う）
 - イベントから生成した Entity はすべて AdhocEntity とする。

 これらの制約のため、REVisual 等は Game_Event のインスタンスを直接参照してはならない。
 eventId で参照すること。


*/

const _DataManager_loadMapData = DataManager.loadMapData;
DataManager.loadMapData = function(mapId) {

    /*
    const floor = REDataManager.floor(mapId);

    if (floor.landId > 0) {
        const land = REData.lands[floor.landId];
        assert(land);

        // ダンジョンフロアである場合、関係するマップデータをすべて読み込む
        REDataManager.landMapDataLoading = true;    // DataManager.isMapLoaded で追加データの読み込みもチェックするようにする
        REDataManager.loadingMapId = mapId;

        // 今いる Land 以外へ遷移したときは、データテーブルをロードする
        if (REDataManager.loadedLandId != land.id) {
            const land_filename = `Map${land.rmmzMapId.padZero(3)}.json`;
            this.loadDataFile("RE_dataLandMap", land_filename);
            REDataManager.loadedLandId = land.id;

            if (land.eventTableMapId > 0) {
                const eventTable_filename = `Map${land.eventTableMapId.padZero(3)}.json`;
                this.loadDataFile("RE_dataEventTableMap", eventTable_filename);
            }
            if (land.itemTableMapId > 0) {
                const itemTable_filename = `Map${land.itemTableMapId.padZero(3)}.json`;
                this.loadDataFile("RE_dataItemTableMap", itemTable_filename);
            }
            if (land.enemyTableMapId > 0) {
                const enemyTable_filename = `Map${land.enemyTableMapId.padZero(3)}.json`;
                this.loadDataFile("RE_dataEnemyTableMap", enemyTable_filename);
            }
            if (land.trapTableMapId > 0) {
                const trapTable_filename = `Map${land.trapTableMapId.padZero(3)}.json`;
                this.loadDataFile("RE_dataTrapTableMap", trapTable_filename);
            }
        }
        else {
            // 同じ Land 内の Floor 間遷移。Land 情報をロードする必要はない。
        }

        if (floor.mapKind == REFloorMapKind.FixedMap) {
            // 固定マップへの直接遷移。
            // この場合は通常のマップ読み込みを行う。
            _DataManager_loadMapData.call(DataManager, mapId);
        }
        else {
            // ランダム・シャッフルマップへの遷移は、現在のフロアに応じてロードするマップがかわるため、
            // Land 情報のロードが終わったあとに行う。(=> Scene_Map.prototype.isReady)
        }
    }
    else {
        // 普通のマップ
        REGame.map.releaseMap();
        REDataManager.landMapDataLoading = false;
        _DataManager_loadMapData.call(DataManager, mapId);
    }
    */
    //REGame.map.releaseMap();
    _DataManager_loadMapData.call(DataManager, mapId);
}

// Scene_Map.isReady() から呼ばれる
const _DataManager_isMapLoaded = DataManager.isMapLoaded;
DataManager.isMapLoaded = function() {
    const result = _DataManager_isMapLoaded.call(DataManager);
    return result;
    /*
    if (result) {
        if (REDataManager.landMapDataLoading) {
            const land = REData.lands[REDataManager.loadedLandId];
            if (!window["RE_dataLandMap"]) {
                return false;
            }
            if (land.eventTableMapId > 0 && !window["RE_dataEventTableMap"]) {
                return false;
            }
            if (land.itemTableMapId > 0 && !window["RE_dataItemTableMap"]) {
                return false;
            }
            if (land.enemyTableMapId > 0 && !window["RE_dataEnemyTableMap"]) {
                return false;
            }
            if (land.trapTableMapId > 0 && !window["RE_dataTrapTableMap"]) {
                return false;
            }

            return true;
            // 続いて Scene_Map.isReady() で、固定マップなどのロードを行う
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
    */
};

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this);
    SGameManager.createGameObjects();
}

const _DataManager_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
    _DataManager_setupNewGame.call(this);
    SGameManager.setupNewGame();
}

const _DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _DataManager_makeSaveContents.call(this);
    contents.re = SGameManager.makeSaveContents();
    return contents;
};

const _DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);
    SGameManager.loadGame(contents.re);
}

// メモ欄に同じタグが複数あった場合、配列としてmetaプロパティに登録する。
// https://makonet.sakura.ne.jp/rpg_tkool/Old/contents/MetaDataEx.js
//const _DataManager_extractMetadata = DataManager.extractMetadata;
DataManager.extractMetadata = function(data: any): void {
    var re = /<([^<>:]+)(:?)([^>]*)>/g;
    data.meta = {};
    for (;;) {
        var match = re.exec(data.note);
        if (match) {
            var value = (match[2] === ':') ? match[3] : true;
            if (data.meta[match[1]]) {
                if (data.meta[match[1]].constructor === Array) {
                    data.meta[match[1]].push(value);
                } else {
                    var _value = data.meta[match[1]];
                    data.meta[match[1]] = [_value, value];
                }
            } else {
                data.meta[match[1]] = value;
            }
        } else {
            break;
        }
    }
}

const _DataManager_saveGame = DataManager.saveGame;
DataManager.saveGame = function(savefileId) {
    return _DataManager_saveGame.call(this, savefileId);
}

const _DataManager_loadGame = DataManager.loadGame;
DataManager.loadGame = function(savefileId) {
    return _DataManager_loadGame.call(this, savefileId);
}
