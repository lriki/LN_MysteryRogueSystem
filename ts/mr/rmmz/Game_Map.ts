import { MRSystem } from "ts/mr/system/MRSystem";
import { SView } from "ts/mr/system/SView";
import { Log } from "../Common";
import { MRData } from "../data/MRData";
import { MRDataManager } from "../data/MRDataManager";
import { MRLively } from "../lively/MRLively";
import { STransferMapDialog } from "../system/dialogs/STransferMapDialog";
import { SGameManager } from "../system/SGameManager";
import { SRmmzHelpers } from "../system/SRmmzHelpers";
import { MRView } from "../view/MRView";
import { RMMZHelper } from "./RMMZHelper";

declare global {
    interface Game_Map {
        //isRMMZDefaultSystemMap(): boolean;
        //isRESystemMap(): boolean;
        unlinkREEvents(): void;
    }
}

Game_Map.prototype.unlinkREEvents = function(): void {
    for (const event of this.events()) {
        if (event.isREEvent()) {
            $dataMap.events[event.eventId()] = null;
        }
    }
}

// Map 移動したときに呼ばれる。
// セーブデータをロードしたときは呼ばれない。
//
// SceneManager.updateScene
//   Scene_Map.prototype.isReady 
//     Scene_Map.prototype.onMapLoaded 
//       Game_Player.prototype.performTransfer
//         Game_Map.prototype.setup
//
// SceneManager.updateScene (上記 isReady チェック後)
//   Scene_Map.prototype.start
//     Scene_Map.prototype.onTransferEnd
//       Scene_Base.prototype.requestAutosave

const _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
    MRLively.messageHistory.clear();
    
    // Game_Map.setup が呼ばれるのは、マップが切り替わるとき。
    // タイミングの都合で DataManager.onLoad によって前のマップの REEvent が $dataMap.event に含まれているので、これを削除しておく。
    //this.unlinkREEvents();

    _Game_Map_setup.call(this, mapId);

    // performTransfer() が呼ばれる時点では、RMMZ のマップ情報はロード済み。
    // transfarEntity で Player 操作中の Entity も別マップへ移動する。
    // この中で、Camera が Player を注視していれば Camera も Floor を移動することで、
    // REシステムとしてのマップ遷移も行われる。
    //
    // Game_Map 呼び出し元の Game_Player.performTransfer() で行うのも手だが、
    // performTransfer() は同一マップ内で位置だけ移動するときも呼び出されるため、
    // 本当に別マップに移動したときだけ処理したいものは Game_Map.setup() で行った方がよい。


    // Land 定義マップ、初期配置されているイベントを非表示にしておく。
    // ランダム Entity 生成ではこれが動的イベントの原本になることもあるので、削除はしない。
    if (MRDataManager.isLandMap(mapId)) {
        for (const event of this.events()) {
            event.setTransparent(true);
        }
        $gamePlayer.hideFollowers();
    }

    MRView.dialogManager?.onRmmzSetupMapCompleted();

    // TacticsMap であれば、@MR-Spawner である Event を非表示にしておく
    if (MRLively.mapView.currentFloorId.isTacticsMap2) {
        for (const event of this.events()) {
            const data = SRmmzHelpers.readEntityMetadata(event, $gameMap.mapId());
            if (data) {
                event.setTransparent(true);
            }
        }
        $gamePlayer.hideFollowers();
    }
}

const _Game_Map_tileset = Game_Map.prototype.tileset;
Game_Map.prototype.tileset = function() {
    const view = SView.getTilemapView();
    if (view.tilesetId)
        return $dataTilesets[view.tilesetId];
    else
        return _Game_Map_tileset.call(this);
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive: boolean) {
    _Game_Map_update.call(this, sceneActive);

    //SGameManager.attemptRestartFloor();

    if (MRLively.mapView.currentMap.lastKeeperCount != MRLively.mapView.currentMap.keeperCount &&
        MRLively.mapView.currentMap.keeperCount == 0) {
        RMMZHelper.triggerOnKeeperLostEvent();
    }
    MRLively.mapView.currentMap.lastKeeperCount = MRLively.mapView.currentMap.keeperCount;
}

/*
Game_Map.prototype.isRMMZDefaultSystemMap = function(): boolean {
    return REData.maps[this.mapId()].defaultSystem;
}

Game_Map.prototype.isRESystemMap = function(): boolean {
    return REGame.map.isValid();
}
*/

const _Game_Map_autoplay = Game_Map.prototype.autoplay;
Game_Map.prototype.autoplay = function() {
    const floorId = MRLively.mapView.currentMap.floorId();
    if (floorId.isDungeonMap2) {
        const data = floorId.floorInfo;
        if (data.bgmName != "") {
            AudioManager.playBgm({ name: data.bgmName, pan: 0, pitch: data.bgmPitch, volume: data.bgmVolume }, 0);
            return;
        }
    }

    _Game_Map_autoplay.call(this);
}

