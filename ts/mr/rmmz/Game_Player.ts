import { MRLively } from "../lively/MRLively";
import { MRView } from "../view/MRView";
import { RMMZHelper } from "./RMMZHelper";

const _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
}

const _Game_Player_isTransparent = Game_Player.prototype.isTransparent;
Game_Player.prototype.isTransparent = function() {
    if (MRLively.map.floorId().isTacticsMap())
        return true;    // RE マップ中は常に非表示
    else
        return _Game_Player_isTransparent.call(this);
};

const _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(): boolean {
    // REma マップではマニュアル移動を禁止
    if (MRLively.map.floorId().isTacticsMap()) {
        return false;
    }

    // 通常マップでも、 Dialog 表示中は移動を禁止する
    if (!MRView.dialogManager?.dialogNavigator.isEmpty) {
        return false;
    }
    return _Game_Player_canMove.call(this);
}

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
        const entity = MRLively.camera.focusedEntity();
        if (entity) {
            $gamePlayer.locate(entity.mx, entity.my);
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
