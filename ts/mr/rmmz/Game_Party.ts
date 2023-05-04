import { LInventoryBehavior } from "../lively/entity/LInventoryBehavior";
import { MRLively } from "../lively/MRLively";

// たくさんの場所に条件を追加しなければならなくなる。
const _Game_Message_isBusy = Game_Message.prototype.isBusy;
Game_Message.prototype.isBusy = function() {
    return (
        _Game_Message_isBusy.call(this) ||
        MRLively.challengeResultShowing
    );
};

function playerInventory(): LInventoryBehavior | undefined {
    const player = MRLively.mapView.focusedEntity();
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
