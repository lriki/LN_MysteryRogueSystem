import { REGame } from "./objects/REGame";
import { REVisual } from "./visual/REVisual";

var _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
}

var _Game_Player_isTransparent = Game_Player.prototype.isTransparent;
Game_Player.prototype.isTransparent = function() {
    if ($gameMap.isRESystemMap())
        return true;    // RE マップ中は常に非表示
    else
        return _Game_Player_isTransparent.call(this);
};

var _Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function(): boolean {
    if (!REVisual.manager?._dialogNavigator.isEmpty()) {
        // 通常マップでも、 Dialog 表示中は移動を禁止する
        return false;
    }
    return _Game_Player_canMove.call(this);
}

var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
    const oldIsTransferring = this.isTransferring();

    

    // $gameMap.setup() などはオリジナルの処理の中で行われる
    _Game_Player_performTransfer.call(this);
}
