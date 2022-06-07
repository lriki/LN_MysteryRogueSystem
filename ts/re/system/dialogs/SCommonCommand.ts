import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DCommon";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UAction } from "ts/re/usecases/UAction";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";
import { SItemSelectionDialog } from "./SItemSelectionDialog";


export class SCommonCommand {
    
    public static handleAction(dialog: SDialog, actor: LEntity, inventory: LInventoryBehavior, item: LEntity, actionId: DActionId): void {
        if (UAction.checkItemSelectionRequired(item, actionId)) {
            // 対象アイテムの選択が必要
            
            const model = new SItemSelectionDialog(actor, inventory);
            dialog.openSubDialog(model, (result: SItemSelectionDialog) => {
                if (result.isSubmitted) {
                    const target = model.selectedEntity();
                    assert(target);
                    const activity = (new LActivity).setup(actionId, actor, item, actor.dir);
                    activity.setObjects2([target]);
                    RESystem.dialogContext.postActivity(activity);
                }
                else {
                    //this.activateCommandWindow();
                }
                return false;
            });
        }
        else {
            const activity = (new LActivity).setup(actionId, actor, item, actor.dir);
            RESystem.dialogContext.postActivity(activity);
            dialog.submit();
        }
    }
}
