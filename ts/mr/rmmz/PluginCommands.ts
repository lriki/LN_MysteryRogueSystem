import { assert, tr2 } from "ts/mr/Common";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { REVisual } from "ts/mr/view/REVisual";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { MRBasics } from "../data/MRBasics";
import { LEntityId } from "../lively/LObject";
import { LEntity } from "../lively/LEntity";
import { SWarehouseStoreDialog } from "../system/dialogs/SWarehouseStoreDialog";
import { USearch } from "../utility/USearch";
import { SWarehouseWithdrawDialog } from "../system/dialogs/SWarehouseWithdrawDialog";
import { UProperty } from "../utility/UProperty";
import { SItemSellDialog } from "../system/dialogs/SItemSellDialog";
import { RMMZHelper } from "./RMMZHelper";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";

const pluginName: string = "LN_MysteryRogueSystem";

PluginManager.registerCommand(pluginName, "RE.ShowChallengeResult", (args: any) => {
    REGame.challengeResultShowing = true;
    $gameMap._interpreter.setWaitMode("REResultWinodw");
});

PluginManager.registerCommand(pluginName, "MR-ShowWarehouseStoreDialog", (args: any) => {
    const serviceProviderKey: string = args.serviceProviderKey;
    const serviceUserKey: string = args.serviceUserKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        RESystem.commandContext.openDialog(player, new SWarehouseStoreDialog(USearch.getEntityByKeyPattern(serviceUserKey), USearch.getEntityByKeyPattern(serviceProviderKey)), false)
        .then((d: SWarehouseStoreDialog) => {
            $gameVariables.setValue(MRBasics.variables.result, d.result);
        });
        $gameMap._interpreter.setWaitMode("MR-Dialog");
    }
});

PluginManager.registerCommand(pluginName, "MR-ShowWarehouseWithdrawDialog", (args: any) => {
    const serviceProviderKey: string = args.serviceProviderKey;
    const serviceUserKey: string = args.serviceUserKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        RESystem.commandContext.openDialog(player, new SWarehouseWithdrawDialog(USearch.getEntityByKeyPattern(serviceUserKey), USearch.getEntityByKeyPattern(serviceProviderKey)), false)
        .then((d: SWarehouseWithdrawDialog) => {
            $gameVariables.setValue(MRBasics.variables.result, d.result);
        });
        $gameMap._interpreter.setWaitMode("MR-Dialog");
    }
});

PluginManager.registerCommand(pluginName, "MR-ShowItemSellDialog", (args: any) => {
    const serviceProviderKey: string = args.serviceProviderKey;
    const serviceUserKey: string = args.serviceUserKey;
    const inventoryOwnerKey: string = args.inventoryOwnerKey;
    if (REVisual.manager) {
        const player = REGame.camera.getFocusedEntity();
        RESystem.commandContext.openDialog(player, new SItemSellDialog(USearch.getEntityByKeyPattern(serviceProviderKey), USearch.getEntityByKeyPattern(serviceUserKey), USearch.getEntityByKeyPattern(inventoryOwnerKey)), false)
        .then((d: SItemSellDialog) => {
            $gameVariables.setValue(MRBasics.variables.result, d.resultItems.length);
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
            REGame.world.transferEntity(entity, newFloorId);

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
                if (x.data.entity.key == actorKey) {
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
        const stateId = MRData.getState(stateKey).id;
        const has = actor._deathResult.states().includes(stateId);
        $gameVariables.setValue(MRBasics.variables.result, has ? 1 : 0);
    }
    else {
        $gameVariables.setValue(MRBasics.variables.result, -1);
    }
});

PluginManager.registerCommand(pluginName, "MR-SetProperty", function(this: Game_Interpreter, args: any) {
    const entityKey = args["entityKey"];
    const propertyPath = args["property"];
    const value = args["value"];
    UProperty.setValue(entityKey, propertyPath, UProperty.getValueByVariablePattern(value));
});

PluginManager.registerCommand(pluginName, "MR-GetProperty", function(this: Game_Interpreter, args: any) {
    const entityKey = args["entityKey"];
    const property = args["property"];
    const variable = args["variable"];
    const entity = USearch.getEntityByKeyPattern(entityKey);
    RMMZHelper.setVariable(variable, UProperty.getValueFromEntity(entity, property));
});

PluginManager.registerCommand(pluginName, "MR-ResetStatus", function(this: Game_Interpreter, args: any) {
    const entityKey = args["entityKey"];
    const entity = USearch.getEntityByKeyPattern(entityKey);
    entity.resetStatus();
});

PluginManager.registerCommand(pluginName, "MR-ResetInventory", function(this: Game_Interpreter, args: any) {
    const entityKey = args["entityKey"];
    const entity = USearch.getEntityByKeyPattern(entityKey);
    const inventory = entity.findEntityBehavior(LInventoryBehavior);
    if (inventory) {
        inventory.reset();
    }
});
