import { tr2 } from "../Common";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { LEntity } from "../lively/LEntity";
import { MRLively } from "../lively/MRLively";
import { SFeetDialog } from "../system/dialogs/SFeetDialog";
import { SItemListDialog, SItemListDialogSourceAction } from "../system/dialogs/SItemListDialog";
import { SCommandContext } from "../system/SCommandContext";
import { SDialog } from "../system/SDialog";
import { SDialogContext } from "../system/SDialogContext";

export class UDialog {
    
    public static postOpenInventoryDialog(cctx: SCommandContext, entity: LEntity, onClosed: (dialog: SItemListDialog) => void): boolean {
        const dctx = cctx.dialogContext;
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        if (inventory) {
            dctx.activeDialog().openSubDialog(new SItemListDialog(entity, inventory, SItemListDialogSourceAction.Default), onClosed);
            return true;
        }
        else {
            return false;
        }
    }
    
    public static postOpenFeetDialog(cctx: SCommandContext, entity: LEntity, onClosed: (dialog: SFeetDialog) => void): boolean {
        const dctx = cctx.dialogContext;
        const feetEntity = MRLively.mapView.currentMap.firstFeetEntity(entity);
        if (feetEntity) {
            dctx.activeDialog().openSubDialog(new SFeetDialog(entity, feetEntity), onClosed);
            return true;
        }
        else {
            cctx.postMessage(tr2("足元には何もない。"));
            return false;
        }
    }

    public static openSkillDialog(dctx: SDialogContext, model: SDialog, entity: LEntity): void {
    }
}
