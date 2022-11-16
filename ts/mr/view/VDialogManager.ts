import { assert } from "../Common";
import { SDetailsDialog } from "../system/dialogs/SDetailsDialog";
import { SEventExecutionDialog } from "../system/dialogs/SEventExecutionDialog";
import { SFeetDialog } from "../system/dialogs/SFeetDialog";
import { SItemListDialog } from "../system/dialogs/SItemListDialog";
import { SItemSelectionDialog } from "../system/dialogs/SItemSelectionDialog";
import { SItemSellDialog } from "../system/dialogs/SItemSellDialog";
import { SMainMenuDialog } from "../system/dialogs/SMainMenuDialog";
import { SNicknameDialog } from "../system/dialogs/SNicknameDialog";
import { SPlayerDialog } from "../system/dialogs/SPlayerDialog";
import { SWarehouseStoreDialog } from "../system/dialogs/SWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "../system/dialogs/SWarehouseWithdrawDialog";
import { SDialog } from "../system/SDialog";
import { VDialogNavigator } from "./dialogs/VDialogNavigator";
import { VEventExecutionDialog } from "./dialogs/VEventExecutionDialog";
import { VDetailsDialog } from "./dialogs/VDetailsDialog";
import { VFeetDialog } from "./dialogs/VFeetDialog";
import { VItemListDialog } from "./dialogs/VItemListDialog";
import { VItemSelectionDialog } from "./dialogs/VItemSelectionDialog";
import { VItemSellDialog } from "./dialogs/VItemSellDialog";
import { VMainMenuDialog } from "./dialogs/VMenuDialog";
import { VNicknameDialog } from "./dialogs/VNicknameDialog";
import { VPlayerDialog } from "./dialogs/VPlayerDialog";
import { VWarehouseStoreDialog } from "./dialogs/VWarehouseStoreDialog";
import { VWarehouseWithdrawDialog } from "./dialogs/VWarehouseWithdrawDialog";
import { MRView } from "./MRView";

export class VDialogManager {
    public readonly dialogNavigator: VDialogNavigator;

    public constructor() {
        this.dialogNavigator = new VDialogNavigator();
    }

    public openDialog(model: SDialog): void {
        let dialog = MRView.ext.onOpenDialog(model);
        if (!dialog) {
            if (model instanceof SPlayerDialog)
                dialog = new VPlayerDialog(model);
            else if (model instanceof SEventExecutionDialog)
                dialog = new VEventExecutionDialog(model);
            else if (model instanceof SWarehouseStoreDialog)
                dialog = new VWarehouseStoreDialog(model);
            else if (model instanceof SWarehouseWithdrawDialog)
                dialog = new VWarehouseWithdrawDialog(model);
            else if (model instanceof SMainMenuDialog)
                dialog = new VMainMenuDialog(model);
            else if (model instanceof SFeetDialog)
                dialog = new VFeetDialog(model);
            else if (model instanceof SItemListDialog)
                dialog = new VItemListDialog(model);
            else if (model instanceof SItemSelectionDialog)
                dialog = new VItemSelectionDialog(model);
            else if (model instanceof SDetailsDialog)
                dialog = new VDetailsDialog(model);
            else if (model instanceof SItemSellDialog)
                dialog = new VItemSellDialog(model);
            else if (model instanceof SNicknameDialog)
                dialog = new VNicknameDialog(model);
        }
        assert(dialog);
        this.dialogNavigator.openDialog(dialog);
    }
}
