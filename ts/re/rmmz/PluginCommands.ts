import { assert } from "ts/re/Common";
import { LandExitResult, REData } from "ts/re/data/REData";
import { SWarehouseDialog } from "ts/re/system/dialogs/SWarehouseDialog";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REGame } from "ts/re/objects/REGame";
import { paramLandExitResultVariableId } from "ts/re/PluginParameters";
import { RESystem } from "ts/re/system/RESystem";
import { REVisual } from "ts/re/visual/REVisual";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { REBasics } from "../data/REBasics";
import { LEntityId } from "../objects/LObject";
import { LEntity } from "../objects/LEntity";

const pluginName: string = "LN_MysteryRogueSystem";

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
        RESystem.commandContext.openDialog(actorEntity, new SWarehouseDialog(actorEntity.entityId(), warehouseEntity.entityId()), false);
        //REVisual.manager._dialogNavigator.push(new VWarehouseDialog(warehouseEntity));
    }
});


PluginManager.registerCommand(pluginName, "MR-ProceedFloorForward", function(this: Game_Interpreter, args: any) {
    UTransfer.proceedFloorForwardForPlayer();
});

PluginManager.registerCommand(pluginName, "MR-ProceedFloorBackword", function(this: Game_Interpreter, args: any) {
    console.log("MR-ProceedFloorBackword");
    const entity = REGame.camera.focusedEntity();
    if (entity) {
        const floorId = entity.floorId;
        const newFloorNumber = floorId.floorNumber() - 1;

        console.log("newFloorNumber", newFloorNumber);

        // 最初のフロアから戻った？
        if (newFloorNumber <= 0) {
            $gameVariables.setValue(paramLandExitResultVariableId, Math.floor(LandExitResult.Escape / 100));

            const exitRMMZMapId = floorId.landData().exitRMMZMapId;
            assert(exitRMMZMapId > 0);
            
            const result = this.command201([0, exitRMMZMapId, 0, 0, 2, 0]);
            assert(result);
        }
        else {
            const newFloorId = LFloorId.make(floorId.landId(), newFloorNumber);
            REGame.world._transferEntity(entity, newFloorId);

            // イベントからの遷移は普通の [場所移動] コマンドと同じように WaitMode を設定する必要がある。
            // しないと、例えば直前に表示していたメッセージウィンドウのクローズなどを待たずに遷移が発生し、isBusy() でハングする。
            this.setWaitMode("transfer");
        }
    }
});

PluginManager.registerCommand(pluginName, "MR-DeathResult-GetIncludesState", function(this: Game_Interpreter, args: any) {
    const actorKey = args["actorKey"];
    const stateKey = args["stateKey"];

    let actor: LEntity | undefined;
    if (actorKey) {
        const r = REGame.world.objects().find(x => {
            if (x instanceof LEntity) {
                if (x.data().entity.key == actorKey) {
                    return true;
                }
            }
            return false;
        });
        if (r && r instanceof LEntity) {
            actor = r;
        }
    }
    else {
        const r = REGame.camera.focusedEntity();
        if (r) {
            actor = r;
        }
    }

    if (actor) {
        const stateId = REData.getState(stateKey).id;
        const has = actor._deathResult.states().includes(stateId);
        $gameVariables.setValue(REBasics.variables.result, has ? 1 : 0);
    }
    else {
        $gameVariables.setValue(REBasics.variables.result, -1);
    }
});
