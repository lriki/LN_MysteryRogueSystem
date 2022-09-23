import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { REGame } from "../lively/REGame";

// たくさんの場所に条件を追加しなければならなくなる。
const _Game_Message_isBusy = Game_Message.prototype.isBusy;
Game_Message.prototype.isBusy = function() {
    return (
        _Game_Message_isBusy.call(this) ||
        REGame.challengeResultShowing
    );
};

function playerInventory(): LInventoryBehavior | undefined {
    const player = REGame.camera.focusedEntity();
    if (!player) return undefined;
    return player.findEntityBehavior(LInventoryBehavior);
}

const _Game_Party_gold = Game_Party.prototype.gold;
Game_Party.prototype.gold = function() {
    const inventory = playerInventory();
    return inventory ? inventory.gold() : _Game_Party_gold.call(this);
}

const _Game_Party_gainGold = Game_Party.prototype.gainGold;
Game_Party.prototype.gainGold = function(amount: number) {
    const inventory = playerInventory();
    if (inventory) {
        inventory.gainGold(amount);
    }
    else {
        _Game_Party_gainGold.call(this, amount);
    }
}
