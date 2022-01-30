import { assert, tr2 } from "ts/re/Common";
import { LandExitResult, REData } from "ts/re/data/REData";
import { SWarehouseDialog } from "ts/re/system/dialogs/SWarehouseDialog";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { REVisual } from "ts/re/visual/REVisual";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { REBasics } from "../data/REBasics";
import { LEntityId } from "../objects/LObject";
import { LEntity } from "../objects/LEntity";
import { SWarehouseStoreDialog } from "../system/dialogs/SWarehouseStoreDialog";
import { USearch } from "../usecases/USearch";
import { SWarehouseWithdrawDialog } from "../system/dialogs/SWarehouseWithdrawDialog";
import { UProperty } from "../usecases/UProperty";
import { SItemSellDialog } from "../system/dialogs/SItemSellDialog";

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
    }
});

PluginManager.registerCommand(pluginName, "MR-ShowWarehouseStoreDialog", (args: any) => {
    const actorKey: string = args.actorKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        RESystem.commandContext.openDialog(player, new SWarehouseStoreDialog(player, USearch.getUniqueActorByKey(actorKey)), false)
        .then((d: SWarehouseStoreDialog) => {
            $gameVariables.setValue(REBasics.variables.result, d.resultItems().length);
        });
        $gameMap._interpreter.setWaitMode("MR-Dialog");
    }
});

PluginManager.registerCommand(pluginName, "MR-ShowWarehouseWithdrawDialog", (args: any) => {
    const actorKey: string = args.actorKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        RESystem.commandContext.openDialog(player, new SWarehouseWithdrawDialog(player, USearch.getUniqueActorByKey(actorKey)), false)
        .then((d: SWarehouseWithdrawDialog) => {
            $gameVariables.setValue(REBasics.variables.result, d.resultItems().length);
        });
        $gameMap._interpreter.setWaitMode("MR-Dialog");
    }
});

PluginManager.registerCommand(pluginName, "MR-ShowItemSellDialog", (args: any) => {
    const serviceProviderKey: string = args.serviceProviderKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        const serviceProvider = USearch.getUniqueActorByKey(serviceProviderKey);
        RESystem.commandContext.openDialog(player, new SItemSellDialog(serviceProvider, player, serviceProvider), false)
        .then((d: SItemSellDialog) => {
            $gameVariables.setValue(REBasics.variables.result, d.resultItems.length);
        });
        $gameMap._interpreter.setWaitMode("MR-Dialog");
    }
});

PluginManager.registerCommand(pluginName, "MR-ProceedFloorForward", function(this: Game_Interpreter, args: any) {
    UTransfer.proceedFloorForwardForPlayer();
});

PluginManager.registerCommand(pluginName, "MR-ProceedFloorBackword", function(this: Game_Interpreter, args: any) {
    const entity = REGame.camera.focusedEntity();
    if (entity) {
        const floorId = entity.floorId;
        const newFloorNumber = floorId.floorNumber() - 1;

        // 最初のフロアから戻った？
        if (newFloorNumber <= 0) {
            RESystem.integration.onSetLandExitResult(LandExitResult.Escape);

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

PluginManager.registerCommand(pluginName, "MR-LivingResult-GetIncludesState", function(this: Game_Interpreter, args: any) {
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

PluginManager.registerCommand(pluginName, "MR-SetProperty", function(this: Game_Interpreter, args: any) {
    const entityKey = args["entityKey"];
    const propertyPath = args["propertyPath"];
    const value = args["value"];
    UProperty.setValue(entityKey, propertyPath, value);
});
