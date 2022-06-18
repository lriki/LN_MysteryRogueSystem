import { MRDataManager } from "../data/MRDataManager";
import { REGame } from "../objects/REGame";
import { SGameManager } from "../system/SGameManager";
import { MRData, REFloorMapKind } from "../data/MRData";
import { assert } from "../Common";
import { DHelpers } from "../data/DHelper";

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
    SGameManager.loadGame(contents.re, true);
}

// メモ欄に同じタグが複数あった場合、配列としてmetaプロパティに登録する。
// https://makonet.sakura.ne.jp/rpg_tkool/Old/contents/MetaDataEx.js
//const _DataManager_extractMetadata = DataManager.extractMetadata;
DataManager.extractMetadata = function(data: any): void {
    DHelpers.extractMetadata(data);
}

const _DataManager_saveGame = DataManager.saveGame;
DataManager.saveGame = function(savefileId) {
    return _DataManager_saveGame.call(this, savefileId);
}

const _DataManager_loadGame = DataManager.loadGame;
DataManager.loadGame = function(savefileId) {
    return _DataManager_loadGame.call(this, savefileId);
}

const _DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object) {
    _DataManager_onLoad.call(this, object);
    /*
    if (object === $dataMap && $gameMap) {
        for (const event of $gameMap.events()) {
            if (event instanceof Game_REPrefabEvent) {
                event.restorePrefabEventData();
            }
        }
    }
    */
}
