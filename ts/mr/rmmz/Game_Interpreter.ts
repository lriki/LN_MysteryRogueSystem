import { UTransfer } from "ts/mr/usecases/UTransfer";
import { assert } from "../Common";
import { DEntityCreateInfo, DEntityId } from "../data/DEntity";
import { MRData } from "../data/MRData";
import { LActorBehavior } from "../lively/behaviors/LActorBehavior";
import { LExperienceBehavior } from "../lively/behaviors/LExperienceBehavior";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { LEntity } from "../lively/LEntity";
import { REGame } from "../lively/REGame";
import { SEntityFactory } from "../system/internal";
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

// Conditional Branch
const _Game_Interpreter_command111 = Game_Interpreter.prototype.command111;
Game_Interpreter.prototype.command111 = function(params: any): boolean {
    let handled = false;
    const entity = commandTarget();
    if (entity) {
        let result = false;
        switch (params[0]) {
            case 7: { // Gold
                const inventory = entity.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    switch (params[2]) {
                        case 0: // Greater than or equal to
                            result = inventory.gold() >= params[1];
                            break;
                        case 1: // Less than or equal to
                            result = inventory.gold() <= params[1];
                            break;
                        case 2: // Less than
                            result = inventory.gold() < params[1];
                            break;
                    }
                }
                handled = true;
                break;
            }
            case 8: { // Item
                const inventory = entity.findEntityBehavior(LInventoryBehavior);
                if (inventory) {
                    const entityDataId = MRData.itemData(params[1]).entityId;
                    result = !!inventory.items.find(x => x.dataId == entityDataId);
                }
                handled = true;
                break;
            }
        }

        if (handled) {
            this._branch[this._indent] = result;
            if (this._branch[this._indent] === false) {
                this.skipBranch();
            }
            return true;
        }
    }

    return _Game_Interpreter_command111.call(this, params);
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

function gainItemHelper(interpreter: Game_Interpreter, operation: number, operandType: number, operand: number, itemEntityDataId: DEntityId): boolean {
    const entity = commandTarget();
    if (entity) {
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            const value = Math.min(interpreter.operateValue(operation, operandType, operand), inventory.remaining);
            for (let i = 0; i < value; i++) {
                const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(itemEntityDataId));
                inventory.addEntity(item);
            }
            return true;
        }
    }
    return false;
}

// Change Items
const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
Game_Interpreter.prototype.command126 = function(params) {
    //_Game_Interpreter_command126.call(this, params);
    if (gainItemHelper(this, params[1], params[2], params[3], MRData.itemData(params[0]).entityId)) {
        return true;
    }
    return true;
}

// Change Weapons
const _Game_Interpreter_command127 = Game_Interpreter.prototype.command127;
Game_Interpreter.prototype.command127 = function(params) {
    const entityData = MRData.getItemFromRmmzWeaponId(params[0]);
    if (gainItemHelper(this, params[1], params[2], params[3], entityData.id)) {
        return true;
    }
    return true;
};

// Change Armors
const _Game_Interpreter_command128 = Game_Interpreter.prototype.command128;
Game_Interpreter.prototype.command128 = function(params) {
    const entityData = MRData.getItemFromRmmzArmorId(params[0]);
    if (gainItemHelper(this, params[1], params[2], params[3], entityData.id)) {
        return true;
    }
    return true;
};

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
