import { assert } from "../Common";
import { MRSystem } from "../system/MRSystem";
import { VEntityManager } from "../view/VEntityManager";
import { MRView } from "../view/MRView";
import { MRLively } from "ts/mr/lively/MRLively";
import { RMMZHelper } from "./RMMZHelper";
import { SMainMenuDialog } from "ts/mr/system/dialogs/SMainMenuDialog";
import { SGameManager } from "../system/SGameManager";
import { FloorRestartSequence } from "./FloorRestartSequence";
import { STransferMapDialog } from "../system/dialogs/STransferMapDialog";

declare global {
    interface Scene_Map {
        //_entityVisualSet: REEntityVisualSet | undefined;
    }
}

const _Scene_Map_isReady = Scene_Map.prototype.isReady;
Scene_Map.prototype.isReady = function() {
    return _Scene_Map_isReady.call(this);
}

const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    _Scene_Map_onMapLoaded.call(this);
}

// 遷移後、フェードイン開始前
const _Scene_Map_onTransferEnd = Scene_Map.prototype.onTransferEnd;
Scene_Map.prototype.onTransferEnd = function() {
    _Scene_Map_onTransferEnd.call(this);
    MRView._messageWindowSet?.attemptStartDisplayFloorName();
}


// マップ切り替えのたびに呼び出される。
// Scene_Map.updateTransferPlayer() でマップ遷移を検出すると、
// goto(Scene_Map) で別インスタンスの Scene_Map へ遷移する。
const _Scene_Map_create = Scene_Map.prototype.create;
Scene_Map.prototype.create = function() {
    _Scene_Map_create.call(this);
}

const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {

    // refresh はホントは onMapLoaded のフック内で呼ぶのが自然な気がするが、
    // createDisplayObjects() の前に呼んでおきたい。
    // そうしないと、特にランダムダンジョン内にいるときのセーブデータをロードした後、Tilemap 生成とのタイミングの問題で何も表示されなくなる。
    if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
        MRSystem.mapManager.attemptRefreshVisual();
    }

    // ベースの createDisplayObjects() では update() が一度呼ばれるため、先にインスタンスを作っておく
    assert(!MRView.entityVisualSet);
    MRView.entityVisualSet = new VEntityManager();

    _Scene_Map_createDisplayObjects.call(this);
    
    // REVisual の中で Window を作りたいが、ベースの createWindowLayer() を先に実行しておく必要がある。
    // その後 createWindows() を呼び出す。
    MRView.onSceneChanged(this);
};

const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
}

const _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);

    if (MRView.entityVisualSet) {
        MRView.entityVisualSet.ternimate();
        MRView.entityVisualSet = undefined;
    }
    if (MRView.spriteSet2) {
        //REVisual.spriteSet2.destroy();
        MRView.spriteSet2 = undefined;
    }
}

function isTransterEffectRunning(): boolean {
    if (MRView._messageWindowSet) {
        return MRView._messageWindowSet._floorNameWindow.isEffectRunning();
    }
    else {
        return false;
    }
}


const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {

    FloorRestartSequence.update(this);

    if (!isTransterEffectRunning()) {
        if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
            if (!$gameMap.isEventRunning()) {   // イベント実行中はシミュレーションを行わない
    
                if (STransferMapDialog.isFloorTransfering) {
                    // マップ遷移中はコアシステムとしては何もしない。
                    // performFloorTransfer() すること。
                    //return;
                }
                else {
                    MRSystem.scheduler.stepSimulation();
                }
            }
            
            MRSystem.minimapData.update();
        }
        else {
            // 普通のマップの時は、Command 実行用の Scheduler をずっと動かしておく
            MRLively.immediatelyCommandExecuteScheduler.stepSimulation();
        }
    
    }
    
    else {
    }
    
    MRView.update();

    // Entity と Game_Player の位置を合わせるときは、↑で先に REVisual の座標を更新した後、
    // Scene_Map.update の前に同期をかける必要がある。
    // 位置合わせは Game_Player だけではなく Game_Map や Game_Screen など様々なオブジェクトに対しても影響するため、
    // ここでまず Game_Player を調整した後、残りはコアスクリプトに任せる。
    // (ただし _realX などが中途半端だと座標移動がかかえるので、REMap 上ではすべての Character の update を切っている)
    if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
        if (MRView._syncCamera) {
            RMMZHelper.syncCameraPositionToGamePlayer();
        }
    }
    
    _Scene_Map_update.call(this);
}

const _Scene_Map_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
    if (MRLively.camera.currentMap.floorId().isRMMZDefaultSystemMap()) {
        // 通常の RMMZ マップ & システム
        _Scene_Map_callMenu.call(this);
    }
    else {
        // セーフティマップ。ManualActionDialog は無いので、ここから MainMenu を表示する。
        assert(MRSystem.dialogContext.dialogs().length == 0);
        const actorEntity = MRLively.camera.focusedEntity();
        assert(actorEntity);
        MRSystem.commandContext.openDialog(actorEntity, new SMainMenuDialog(actorEntity), false);
        this.menuCalling = false;
    }
}

const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
Scene_Map.prototype.updateCallMenu = function() {
    if (MRLively.camera.currentMap.floorId().isRMMZDefaultSystemMap()) {
        // 通常の RMMZ マップ & システム
        _Scene_Map_updateCallMenu.call(this);
    }
    else if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
        // タクティクスマップ。MainMenu の表示は ManualActionDialog から行う。
        // Scene_Map からのメニュー表示は行わない。
        this.menuCalling = false;
    }
    else {
        // セーフティマップ。ManualActionDialog は無いので、ここから MainMenu を表示する。
        if (MRSystem.dialogContext.dialogs().length == 0) {
            _Scene_Map_updateCallMenu.call(this);
        }
    }
}

const _Scene_Map_shouldAutosave = Scene_Map.prototype.shouldAutosave;
Scene_Map.prototype.shouldAutosave = function() {
    if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
        return true;
    }
    else {
        return _Scene_Map_shouldAutosave.call(this);
    }
}

const _Scene_Map_isAutosaveEnabled = Scene_Map.prototype.isAutosaveEnabled;
Scene_Base.prototype.isAutosaveEnabled = function() {
    if (MRLively.camera.currentMap.floorId().isTacticsMap()) {
        return true;
    }
    else {
        return _Scene_Map_isAutosaveEnabled.call(this);
    }
}

const _Scene_Map_fadeOutForTransfer = Scene_Map.prototype.fadeOutForTransfer;
Scene_Map.prototype.fadeOutForTransfer = function() {
    if (FloorRestartSequence.isProcessing()) {
        // Scene_Map.stop() で再びフェードアウトが開始してしまうのを避ける
    }
    else {
        _Scene_Map_fadeOutForTransfer.call(this);
    }
}

const _Scene_Map_needsFadeIn = Scene_Map.prototype.needsFadeIn;
Scene_Map.prototype.needsFadeIn = function() {
    if (FloorRestartSequence.isProcessing()) {
        return true;
    }
    else {
        return _Scene_Map_needsFadeIn.call(this);
    }
}
