import { REGame } from "../objects/REGame";
import { REVisual } from "../visual/REVisual";
import { RMMZHelper } from "./RMMZHelper";

const _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
}

const _Game_Player_isTransparent = Game_Player.prototype.isTransparent;
Game_Player.prototype.isTransparent = function() {
    if (REGame.map.floorId().isEntitySystemMap())
        return true;    // RE マップ中は常に非表示
    else
        return _Game_Player_isTransparent.call(this);
};

const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(): boolean {
    // REma マップではマニュアル移動を禁止
    if (REGame.map.floorId().isEntitySystemMap()) {
        return false;
    }

    // 通常マップでも、 Dialog 表示中は移動を禁止する
    if (!REVisual.manager?._dialogNavigator.isEmpty()) {
        return false;
    }
    return _Game_Player_canMove.call(this);
}

// const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
// Game_Player.prototype.performTransfer = function() {
//     const oldIsTransferring = this.isTransferring();

    
//     console.log("_Game_Player_performTransfer", this.newMapId());

//     // $gameMap.setup() などはオリジナルの処理の中で行われる
//     _Game_Player_performTransfer.call(this);
// }

const _Game_Player_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
    _Game_Player_refresh.call(this);

    if (RMMZHelper.isRESystemMap()) {
        // ランダムマップで配置された結果を、Player 位置に再設定する。
        // Game_Player.prototype.performTransfer() の処理は次の順で行われる。
        // - $gameMap.setup()
        // - locate(newPos);
        // - refresh();
        // ランダム配置は $gameMap.setup() の中で行われるが、その後 $gamePlayer.locate があるので、
        // 座標の再設定は refresh() のタイミングで行う必要がある。
        // なお、locate() を呼んでいるのは、合わせて $gameMap.setDisplayPos() が必要だから。
        // これが無いと、プレイヤー初期位置が画面中央になるようにスクロールしてくれない。
        const entity = REGame.camera.focusedEntity();
        if (entity) {
            $gamePlayer.locate(entity.x, entity.y);
        }
    }
}

const _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive: boolean) {
    
    /*
    if ($gameMap.isRESystemMap()) {
        const entity = REGame.camera.focusedEntity();
        if (entity && REVisual.entityVisualSet) {
            const visual = REVisual.entityVisualSet.findEntityVisualByEntity(entity);
            if (visual) {
                const pos = visual.position();
                //console.log("this._realX", this._realX - pos.x);
                
                const lastScrolledX = this.scrolledX();
                const lastScrolledY = this.scrolledY();

                this._realX = pos.x;
                this._realY = pos.y;
                this._x = entity.x;
                this._y = entity.y;

                this.updateScroll(lastScrolledX, lastScrolledY);
            }
        }
    }
    else {
        */
        _Game_Player_update.call(this, sceneActive);
    //}
}
