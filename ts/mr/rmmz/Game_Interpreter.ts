import { UTransfer } from "ts/mr/utility/UTransfer";
import { assert } from "../Common";
import { DEntityId } from "../data/DEntity";
import { DEntityCreateInfo } from "../data/DSpawner";
import { MRData } from "../data/MRData";
import { LExperienceBehavior } from "../lively/behaviors/LExperienceBehavior";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { LEntity } from "../lively/LEntity";
import { MRLively } from "../lively/MRLively";
import { SEntityFactory } from "../system/internal";
import { MRSystem } from "../system/MRSystem";
import { Game_MRInterpreterContext } from "./Game_MRInterpreterContext";

declare global {
    interface Game_Interpreter {
        _MR_gameInterpreterContext: Game_MRInterpreterContext | undefined;

        getMRInterpreterContext(): Game_MRInterpreterContext;
    }
}

Game_Interpreter.prototype.getMRInterpreterContext = function(): Game_MRInterpreterContext {
    if (!this._MR_gameInterpreterContext) {
        this._MR_gameInterpreterContext = new Game_MRInterpreterContext();
    }
    return this._MR_gameInterpreterContext;
}

const _Game_Interpreter_setup = Game_Interpreter.prototype.setup;
Game_Interpreter.prototype.setup = function(list, eventId) {
    _Game_Interpreter_setup.call(this, list, eventId);

    if (this._eventId != 0) {
        // コモンイベントではなく、イベント実行内容からの呼び出し。
        // イベントコマンドの対象をリセットしておく。
        MRLively.system.eventInterpreterContextKey = undefined;
    }
};

const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return MRLively.challengeResultShowing;
    }
    else if (this._waitMode == "MR-Dialog") {
        return MRSystem.dialogContext._hasDialogModel() || MRSystem.commandContext.checkOpenDialogRequired();
    }
    else {
        return _Game_Interpreter_updateWaitMode.call(this);
    }
}

// [条件分岐] Conditional Branch
const _Game_Interpreter_command111 = Game_Interpreter.prototype.command111;
Game_Interpreter.prototype.command111 = function(params: any): boolean {
    let handled = false;
    const entity = MRLively.system.getEventCommandTarget();
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

// [場所移動] Transfer Player
const _Game_Interpreter_command201 = Game_Interpreter.prototype.command201;
Game_Interpreter.prototype.command201 = function(params: any): boolean {
    if (!_Game_Interpreter_command201.call(this, params)) return false;

    UTransfer.transterRmmzDirectly($gamePlayer._newMapId, $gamePlayer._newX, $gamePlayer._newY);
    return true;
}

// Change Party Member
const _Game_Interpreter_command129 = Game_Interpreter.prototype.command129;
Game_Interpreter.prototype.command129 = function(params: any): boolean {
    const result = _Game_Interpreter_command129.call(this, params);
    const rmmzActorId = $gameParty.members()[0].actorId();
    MRLively.mapView.focus(MRLively.world.getEntityByRmmzActorId(rmmzActorId));
    return result;
}

// [お金の増減] Change Gold
const _Game_Interpreter_command125 = Game_Interpreter.prototype.command125;
Game_Interpreter.prototype.command125 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) {
        // RMMZ default process.
        return _Game_Interpreter_command125.call(this, params);
    }
    else { 
        // MR-System process.
        const value = this.operateValue(params[0], params[1], params[2]);
        entity.findEntityBehavior(LInventoryBehavior)?.gainGold(value);
    }
    return true;
}

// [アイテムの増減] Change Items
const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
Game_Interpreter.prototype.command126 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) { 
        // RMMZ default process.
        return _Game_Interpreter_command126.call(this, params);
    }
    else { 
        // MR-System process.
        const entityData = MRData.itemData(params[0]);
        gainItemHelper(this, entity, params[1], params[2], params[3], entityData.entityId);
        return true;
    }
}

// Change Weapons
const _Game_Interpreter_command127 = Game_Interpreter.prototype.command127;
Game_Interpreter.prototype.command127 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) {
        // RMMZ default process.
        return _Game_Interpreter_command127.call(this, params);
    }
    else {
        // MR-System process.
        const entityData = MRData.getItemFromRmmzWeaponId(params[0]);
        gainItemHelper(this, entity, params[1], params[2], params[3], entityData.id);
        return true;
    }
}

// Change Armors
const _Game_Interpreter_command128 = Game_Interpreter.prototype.command128;
Game_Interpreter.prototype.command128 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) {
        // RMMZ default process.
        return _Game_Interpreter_command128.call(this, params);
    }
    else {
        // MR-System process.
        const entityData = MRData.getItemFromRmmzArmorId(params[0]);
        gainItemHelper(this, entity, params[1], params[2], params[3], entityData.id)
        return true;
    }
}

// Change Level
const _Game_Interpreter_command316 = Game_Interpreter.prototype.command316;
Game_Interpreter.prototype.command316 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) {
        // RMMZ default process.
        return _Game_Interpreter_command316.call(this, params);
    }
    else {
        // MR-System process.
        if (params[1] === 0) {  // TOOD: 
            const entity = MRLively.system.getEventCommandTarget();
            if (entity) {
                const value = this.operateValue(params[2], params[3], params[4]);
                entity.findEntityBehavior(LExperienceBehavior)?.setLevel(entity, value);
            }
        }
        return true;
    }
}

// Recover All
const _Game_Interpreter_command314 = Game_Interpreter.prototype.command314;
Game_Interpreter.prototype.command314 = function(params) {
    const entity = MRLively.system.getEventCommandTarget();
    if (!entity) {
        // RMMZ default process.
        return _Game_Interpreter_command314.call(this, params);
    }
    else {
        // MR-System process.
        if (params[1] === 0) {  // TOOD: 
            const entity = MRLively.system.getEventCommandTarget();
            if (entity) {
                entity.recoverAll();
            }
        }
        return true;
    }
}

function gainItemHelper(interpreter: Game_Interpreter, unit: LEntity, operation: number, operandType: number, operand: number, itemEntityDataId: DEntityId): void {
    const inventory = unit.findEntityBehavior(LInventoryBehavior);
    if (inventory) {
        const value = Math.min(interpreter.operateValue(operation, operandType, operand), inventory.remaining);
        for (let i = 0; i < value; i++) {
            const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(itemEntityDataId));
            inventory.addEntity(item);
        }
    }
}
