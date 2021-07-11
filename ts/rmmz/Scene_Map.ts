import { assert } from "../Common";
import { REData, REFloorMapKind } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { RMMZIntegration } from "./RMMZIntegration";
import { RESystem } from "../system/RESystem";
import { REEntityVisualSet } from "../visual/REEntityVisualSet";
import { REVisual } from "../visual/REVisual";
import { VDirectionArrow } from "ts/visual/VDirectionArrow";
import { REGame } from "ts/objects/REGame";
import { RMMZHelper } from "./RMMZHelper";
import { SMainMenuDialog } from "ts/system/dialogs/SMainMenuDialog";

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
    return _Scene_Map_onMapLoaded.call(this);
}

// 遷移後、フェードイン開始前
const _Scene_Map_onTransferEnd = Scene_Map.prototype.onTransferEnd;
Scene_Map.prototype.onTransferEnd = function() {
    _Scene_Map_onTransferEnd.call(this);
    REVisual._messageWindowSet?.attemptStartDisplayFloorName();
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

    // ベースの createDisplayObjects() では update() が一度呼ばれるため、先にインスタンスを作っておく
    assert(!REVisual.entityVisualSet);
    REVisual.entityVisualSet = new REEntityVisualSet();

    _Scene_Map_createDisplayObjects.call(this);
    
    // REVisual の中で Window を作りたいが、ベースの createWindowLayer() を先に実行しておく必要がある。
    // その後 createWindows() を呼び出す。
    REVisual.onSceneChanged(this);
};

const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
}

const _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);

    if (REVisual.entityVisualSet) {
        REVisual.entityVisualSet.ternimate();
        REVisual.entityVisualSet = undefined;
    }
    if (REVisual.spriteSet2) {
        //REVisual.spriteSet2.destroy();
        REVisual.spriteSet2 = undefined;
    }
}

function isTransterEffectRunning(): boolean {
    if (REVisual._messageWindowSet) {
        return REVisual._messageWindowSet._floorNameWindow.isEffectRunning();
    }
    else {
        return false;
    }
}


const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {

    if (!isTransterEffectRunning()) {
        if (REGame.map.floorId().isEntitySystemMap()) {
            if (!$gameMap.isEventRunning()) {   // イベント実行中はシミュレーションを行わない
    
                if (REGame.camera.isFloorTransfering()) {
                    // マップ遷移中はコアシステムとしては何もしない。
                    // performFloorTransfer() すること。
                    //return;
                }
                else {
                    RESystem.scheduler.stepSimulation();
                }
            }
            
            RESystem.minimapData.update();
        }
        else {
            // 普通のマップの時は、Command 実行用の Scheduler をずっと動かしておく
            REGame.immediatelyCommandExecuteScheduler.stepSimulation();
        }
    
    }
    
    else {
    }
    


    REVisual.update();

    REVisual.postUpdate();

    // Entity と Game_Player の位置を合わせるときは、↑で先に REVisual の座標を更新した後、
    // Scene_Map.update の前に同期をかける必要がある。
    // 位置合わせは Game_Player だけではなく Game_Map や Game_Screen など様々なオブジェクトに対しても影響するため、
    // ここでまず Game_Player を調整した後、残りはコアスクリプトに任せる。
    // (ただし _realX などが中途半端だと座標移動がかかえるので、REMap 上ではすべての Character の update を切っている)
    if (REGame.map.floorId().isEntitySystemMap()) {
        if (REVisual._syncCamera) {
            RMMZHelper.syncCameraPositionToGamePlayer();
        }
    }
    
    
    _Scene_Map_update.call(this);

}

const _Scene_Map_callMenu = Scene_Map.prototype.isMenuCalled;
Scene_Map.prototype.callMenu = function() {
    if (REGame.map.floorId().isRMMZDefaultSystemMap()) {
        // 通常の RMMZ マップ & システム
        _Scene_Map_callMenu.call(this);
    }
    else if (REGame.map.floorId().isEntitySystemMap()) {
        // REシステムマップ
        this.menuCalling = false;
    }
    else {
        assert(RESystem.dialogContext.dialogs().length == 0);

        // REセーフティマップ
        this.menuCalling = false;
        const actorEntity = REGame.camera.focusedEntity();
        assert(actorEntity);
        RESystem.commandContext.openDialog(actorEntity, new SMainMenuDialog(actorEntity), false);
    }
};

/*
// RE Map 内では RMMZ 通常のメニューを禁止する
const _Scene_Map_isMenuCalled = Scene_Map.prototype.isMenuCalled;
Scene_Map.prototype.isMenuCalled = function() {
    if ($gameMap.isRMMZDefaultSystemMap())
        return _Scene_Map_isMenuCalled.call(this);
    else
        return false;
};
*/

