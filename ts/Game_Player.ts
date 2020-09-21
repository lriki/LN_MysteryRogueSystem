import { REGame } from "./RE/REGame";

var _Game_Player_initMembers = Game_Player.prototype.initMembers;
Game_Player.prototype.initMembers = function() {
    _Game_Player_initMembers.call(this);
}

var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
    const oldIsTransferring = this.isTransferring();

    // $gameMap.setup() などはオリジナルの処理の中で行われる
    _Game_Player_performTransfer.call(this);

    // RE Floor への移動
    if (oldIsTransferring && REGame.map.isValid()) {
        const playerEntity = REGame.world.entity(REGame.core.mainPlayerEntiyId);
        if (playerEntity) {
            REGame.world._transfarEntity(playerEntity, REGame.map.floorId(), this.x, this.y);
        }
    }
}
