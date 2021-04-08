import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { LWarehouseDialog } from "ts/dialogs/LWarehouseDialog";
import { LFloorId } from "ts/objects/LFloorId";
import { REGame } from "ts/objects/REGame";
import { RESystem } from "ts/system/RESystem";
import { VWarehouseDialog } from "ts/visual/dialogs/VWarehouseDialog";
import { REVisual } from "ts/visual/REVisual";
import { Scene_Warehouse } from "./Scene_Warehouse";

const pluginName: string = "LN_RoguelikeEngine";

PluginManager.registerCommand(pluginName, "RE.ShowChallengeResult", (args: any) => {
    REGame.challengeResultShowing = true;
    $gameMap._interpreter.setWaitMode("REResultWinodw");
});

PluginManager.registerCommand(pluginName, "RE.ShowWarehouse", (args: any) => {
    const actorId: number = args.actorId;
    if (!args.actorId || args.actorId < 0 || REData.actors.length <= actorId) {
        throw new Error("RE.ShowWarehouse - Invalid 'actorId'.");
    }
    
    if (REVisual.manager) {
        const warehouseEntity = REGame.world.entity(REGame.system.uniqueActorUnits[actorId - 1]);
        const actorEntity = REGame.camera.focusedEntity();
        assert(actorEntity);
        RESystem.commandContext.openDialog(actorEntity, new LWarehouseDialog(actorEntity.entityId(), warehouseEntity.entityId()));
        //REVisual.manager._dialogNavigator.push(new VWarehouseDialog(warehouseEntity));
    }
});


PluginManager.registerCommand(pluginName, "RE-ProceedFloorForward", function(this: Game_Interpreter, args: any) {
    const entity = REGame.camera.focusedEntity();
    if (entity) {

        const floorId = entity.floorId;
        const newFloorNumber = floorId.floorNumber() + 1;

        if (newFloorNumber > REGame.map.land2().maxFloorNumber()) {
            // 最後のフロアを踏破した
            throw new Error("Not implemented.");
        }
        else {
            REGame.world._transferEntity(entity, LFloorId.make(floorId.landId(), newFloorNumber), newFloorNumber, 0);

            // イベントからの遷移は普通の [場所移動] コマンドと同じように WaitMode を設定する必要がある。
            // しないと、例えば直前に表示していたメッセージウィンドウのクローズなどを待たずに遷移が発生し、isBusy() でハングする。
            this.setWaitMode("transfer");
        }
    }
});

PluginManager.registerCommand(pluginName, "RE-ProceedFloorBackword", (args: any) => {
});


