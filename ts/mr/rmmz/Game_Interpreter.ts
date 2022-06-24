import { UTransfer } from "ts/mr/usecases/UTransfer";
import { assert } from "../Common";
import { LActorBehavior } from "../objects/behaviors/LActorBehavior";
import { LExperienceBehavior } from "../objects/behaviors/LExperienceBehavior";
import { LInventoryBehavior } from "../objects/behaviors/LInventoryBehavior";
import { LEntity } from "../objects/LEntity";
import { REGame } from "../objects/REGame";
import { RESystem } from "../system/RESystem";

function commandTarget(): LEntity | undefined {
    return REGame.camera.focusedEntity();
}

const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return REGame.challengeResultShowing;
    }
    else if (this._waitMode == "MR-Dialog") {
        return RESystem.dialogContext._hasDialogModel() || RESystem.commandContext.checkOpenDialogRequired();
    }
    else {
        return _Game_Interpreter_updateWaitMode.call(this);
    }
}

// Transfer Player
const _Game_Interpreter_command201 = Game_Interpreter.prototype.command201;
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
const _Game_Interpreter_command129 = Game_Interpreter.prototype.command129;
Game_Interpreter.prototype.command129 = function(params: any): boolean {
    const result = _Game_Interpreter_command129.call(this, params);
    const rmmzActorId = $gameParty.members()[0].actorId();
    REGame.camera.focus(REGame.world.getEntityByRmmzActorId(rmmzActorId));
    return result;
}

// Change Gold
const _Game_Interpreter_command125 = Game_Interpreter.prototype.command125;
Game_Interpreter.prototype.command125 = function(params) {
    _Game_Interpreter_command125.call(this, params);

    const entity = commandTarget();
    if (entity) {
        const value = this.operateValue(params[0], params[1], params[2]);
        entity.findEntityBehavior(LInventoryBehavior)?.gainGold(value);
    }

    return true;
}

// Change Level
const _Game_Interpreter_command316 = Game_Interpreter.prototype.command316;
Game_Interpreter.prototype.command316 = function(params) {
    _Game_Interpreter_command316.call(this, params);

    if (params[1] === 0) {
        const entity = commandTarget();
        if (entity) {
            const value = this.operateValue(params[2], params[3], params[4]);
            entity.findEntityBehavior(LExperienceBehavior)?.setLevel(entity, value);
        }
    }
    return true;
}

// Recover All
const _Game_Interpreter_command314 = Game_Interpreter.prototype.command314;
Game_Interpreter.prototype.command314 = function(params) {
    _Game_Interpreter_command314.call(this, params);

    if (params[1] === 0) {
        const entity = commandTarget();
        if (entity) {
            entity.recoverAll();
        }
    }
    return true;
}
