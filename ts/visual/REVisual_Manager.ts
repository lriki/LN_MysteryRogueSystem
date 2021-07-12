
import { SManualActionDialog } from "ts/system/dialogs/SManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisualNavigator } from "ts/visual/dialogs/REDialogVisual";
import { VManualActionDialogVisual } from "ts/visual/dialogs/VManualActionDialogVisual";
import { REVisualSequel } from "ts/visual/REVisualSequel";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/system/RESystem";
import { VCollapseSequel } from "./sequels/CollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";
import { VBlowMoveSequel } from "./sequels/VBlowMoveSequel";
import { REVisualSequel_Move } from "./sequels/VMoveSequel";
import { SWarehouseDialog } from "ts/system/dialogs/SWarehouseDialog";
import { VWarehouseDialog } from "./dialogs/VWarehouseDialog";
import { DSequel, DSequelId } from "ts/data/DSequel";
import { VIdleSequel } from "./sequels/VIdleSequel";
import { REData } from "ts/data/REData";
import { VAsleepSequel } from "./sequels/VAsleepSequel";
import { VCommonStoppedSequel } from "./sequels/VCommonStoppedSequel";
import { SEventExecutionDialog } from "ts/system/dialogs/EventExecutionDialog";
import { VDropSequel } from "./sequels/VDropSequel";
import { SMainMenuDialog } from "ts/system/dialogs/SMainMenuDialog";
import { VMainMenuDialog } from "./dialogs/VMenuDialog";
import { SDialogContext } from "ts/system/SDialogContext";
import { LFeetDialog } from "ts/system/dialogs/SFeetDialog";
import { VFeetDialog } from "./dialogs/VFeetDialog";
import { SDialog } from "ts/system/SDialog";
import { SWarehouseStoreDialog } from "ts/system/dialogs/SWarehouseStoreDialog";
import { VWarehouseStoreDialog } from "./dialogs/VWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/system/dialogs/SWarehouseWithdrawDialog";
import { VWarehouseWithdrawDialog } from "./dialogs/VWarehouseWithdrawDialog";
import { SItemListDialog } from "ts/system/dialogs/SItemListDialog";
import { VItemListDialog } from "./dialogs/VItemListDialog";
import { VEscapeSequel } from "./sequels/VEscapeSequel";

/**
 */
export class REVisual_Manager
{
    //private _dialogVisual: REDialogVisual | null;
    private _tileSize: Vector2 = new Vector2(48, 48);
    private _visualSequelFactory: (() => REVisualSequel)[] = [];
    _dialogNavigator: REDialogVisualNavigator = new REDialogVisualNavigator();
    
    constructor() {
        //this._dialogVisual = null;


        this._visualSequelFactory[RESystem.sequels.idle] = () => new VIdleSequel();
        this._visualSequelFactory[RESystem.sequels.MoveSequel] = () => new REVisualSequel_Move();
        this._visualSequelFactory[RESystem.sequels.blowMoveSequel] = () => new VBlowMoveSequel();
        this._visualSequelFactory[RESystem.sequels.dropSequel] = () => new VDropSequel();
        this._visualSequelFactory[RESystem.sequels.attack] = () => new VAttackSequel();
        this._visualSequelFactory[RESystem.sequels.CollapseSequel] = () => new VCollapseSequel();
        this._visualSequelFactory[RESystem.sequels.commonStopped] = () => new VCommonStoppedSequel();
        this._visualSequelFactory[RESystem.sequels.asleep] = () => new VAsleepSequel();
        this._visualSequelFactory[RESystem.sequels.escape] = () => new VEscapeSequel();
    }

    tileSize(): Vector2 {
        return this._tileSize;
    }

    _finalize() {
    }

    createVisualSequel(sequelId: DSequelId): REVisualSequel {
        const factory = this._visualSequelFactory[sequelId];
        if (factory) {
            return factory();
        }
        else {
            throw new Error(`Visual Sequel not registerd. (id: ${sequelId}, name: ${REData.sequels[sequelId].name})`);
        }
    }

    openDialog(model: SDialog): void {
        if (model instanceof SManualActionDialog)
            this._dialogNavigator._openDialog(new VManualActionDialogVisual(model));
        else if (model instanceof SEventExecutionDialog)
            this._dialogNavigator._openDialog(new REEventExecutionDialogVisual(model));
        else if (model instanceof SWarehouseDialog)
            this._dialogNavigator._openDialog(new VWarehouseDialog(model));
        else if (model instanceof SWarehouseStoreDialog)
            this._dialogNavigator._openDialog(new VWarehouseStoreDialog(model));
        else if (model instanceof SWarehouseWithdrawDialog)
            this._dialogNavigator._openDialog(new VWarehouseWithdrawDialog(model));
        else if (model instanceof SMainMenuDialog)
            this._dialogNavigator._openDialog(new VMainMenuDialog(model));
        else if (model instanceof LFeetDialog)
            this._dialogNavigator._openDialog(new VFeetDialog(model));
        else if (model instanceof SItemListDialog)
            this._dialogNavigator._openDialog(new VItemListDialog(model));
            

            
        //else if (d instanceof LMainMenuDialog)
        //    this._dialogNavigator._openDialog(new VMenuDialog(d));

            
        // AI 用の Dialog を開いた時など、UI を伴わないものもある
        //return undefined;
    }

    closeDialog(context: SDialogContext) {
        this._dialogNavigator.closeDialog();
        //this._dialogNavigator.clear();
        //if (this._dialogVisual) {
        //    this._dialogVisual.onClose();
        //    this._dialogVisual = null;
        //}
    }

}

