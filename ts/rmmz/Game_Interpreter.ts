import { LFloorId } from "ts/objects/LFloorId";
import { UTransfer } from "ts/usecases/UTransfer";
import { REGame } from "../objects/REGame";

var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return REGame.challengeResultShowing;
    }
    else {
        return _Game_Interpreter_updateWaitMode.call(this);
    }
}

// Transfer Player
var _Game_Interpreter_command201 = Game_Interpreter.prototype.command201;
Game_Interpreter.prototype.command201 = function(params: any): boolean {
    if (!_Game_Interpreter_command201.call(this, params)) return false;

    UTransfer.transterRmmzDirectly($gamePlayer._newMapId, $gamePlayer._newX, $gamePlayer._newY);
    /*
    const floorId = LFloorId.makeFromMapTransfarInfo($gamePlayer._newMapId, $gamePlayer._newX);
    
    const playerEntity = REGame.camera.focusedEntity();
    if (playerEntity) {
        if (floorId.isRandomMap())
            REGame.world._transferEntity(playerEntity, floorId);
        else
            REGame.world._transferEntity(playerEntity, floorId, $gamePlayer._newX, $gamePlayer._newY);
    }
*/
    return true;
}


