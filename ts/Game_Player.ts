import { REGame } from "./RE/REGame";

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


var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
    const oldIsTransferring = this.isTransferring();

    // $gameMap.setup() などはオリジナルの処理の中で行われる
    _Game_Player_performTransfer.call(this);

    // performTransfer() が呼ばれる時点では、RMMZ のマップ情報はロード済み。
    // transfarEntity で Player 操作中の Entity も別マップへ移動する。
    // この中で、Camera が Player を注視していれば Camera も Floor を移動することで、
    // REシステムとしてのマップ遷移も行われる。
    if (oldIsTransferring && REGame.map.isValid()) {
        const playerEntity = REGame.world.entity(REGame.core.mainPlayerEntiyId);
        if (playerEntity) {
            REGame.world._transfarEntity(playerEntity, REGame.map.floorId(), this.x, this.y);
        }
    }
}
