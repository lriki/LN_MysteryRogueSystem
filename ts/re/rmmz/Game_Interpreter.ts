import { UTransfer } from "ts/re/usecases/UTransfer";
import { assert } from "../Common";
import { LEntity } from "../objects/LEntity";
import { REGame } from "../objects/REGame";
import { RESystem } from "../system/RESystem";

var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return REGame.challengeResultShowing;
    }
    else if (this._waitMode == "MR-Dialog") {
        console.log("wait MR-Dialog", RESystem.dialogContext._hasDialogModel() || RESystem.commandContext.checkOpenDialogRequired());
        return RESystem.dialogContext._hasDialogModel() || RESystem.commandContext.checkOpenDialogRequired();
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

// Change Party Member
var _Game_Interpreter_command129 = Game_Interpreter.prototype.command129;
Game_Interpreter.prototype.command129 = function(params: any): boolean {
    const result = _Game_Interpreter_command129.call(this, params);
    const rmmzActorId = $gameParty.members()[0].actorId();
    REGame.camera.focus(REGame.world.getEntityByRmmzActorId(rmmzActorId));
    return result;
}


