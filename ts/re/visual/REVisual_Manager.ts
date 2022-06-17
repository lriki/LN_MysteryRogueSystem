
import { SManualActionDialog } from "ts/re/system/dialogs/SManualDecisionDialog";
import { Vector2 } from "ts/re/math/Vector2";
import { REDialogVisualNavigator } from "ts/re/visual/dialogs/REDialogVisual";
import { VManualActionDialogVisual } from "ts/re/visual/dialogs/VManualActionDialogVisual";
import { REVisualSequel } from "ts/re/visual/REVisualSequel";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/re/system/RESystem";
import { VCollapseSequel } from "./sequels/VCollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";
import { VBlowMoveSequel } from "./sequels/VBlowMoveSequel";
import { REVisualSequel_Move } from "./sequels/VMoveSequel";
import { SWarehouseDialog } from "ts/re/system/dialogs/SWarehouseDialog";
import { VWarehouseDialog } from "./dialogs/VWarehouseDialog";
import { DSequel, DSequelId } from "ts/re/data/DSequel";
import { VIdleSequel } from "./sequels/VIdleSequel";
import { REData } from "ts/re/data/REData";
import { VAsleepSequel } from "./sequels/VAsleepSequel";
import { VCommonStoppedSequel } from "./sequels/VCommonStoppedSequel";
import { SEventExecutionDialog } from "ts/re/system/dialogs/SEventExecutionDialog";
import { VDropSequel } from "./sequels/VDropSequel";
import { SMainMenuDialog } from "ts/re/system/dialogs/SMainMenuDialog";
import { VMainMenuDialog } from "./dialogs/VMenuDialog";
import { SDialogContext } from "ts/re/system/SDialogContext";
import { SFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
import { VFeetDialog } from "./dialogs/VFeetDialog";
import { SDialog } from "ts/re/system/SDialog";
import { SWarehouseStoreDialog } from "ts/re/system/dialogs/SWarehouseStoreDialog";
import { VWarehouseStoreDialog } from "./dialogs/VWarehouseStoreDialog";
import { SWarehouseWithdrawDialog } from "ts/re/system/dialogs/SWarehouseWithdrawDialog";
import { VWarehouseWithdrawDialog } from "./dialogs/VWarehouseWithdrawDialog";
import { SItemListDialog } from "ts/re/system/dialogs/SItemListDialog";
import { VItemListDialog } from "./dialogs/VItemListDialog";
import { VEscapeSequel } from "./sequels/VEscapeSequel";
import { VEarthquake2Sequel } from "./sequels/VEarthquake2Sequel";
import { SDetailsDialog } from "ts/re/system/dialogs/SDetailsDialog";
import { VDetailsDialog } from "./dialogs/VDetailsDialog";
import { VUseItemSequel } from "./sequels/VUseItemSequel";
import { VExplosionSequel } from "./sequels/VExplosionSequel";
import { VDownSequel } from "./sequels/VDownSequel";
import { MRBasics } from "../data/MRBasics";
import { VWarpSequel } from "./sequels/VWarpSequel";
import { VStumbleSequel } from "./sequels/VStumbleSequel";
import { VJumpSequel } from "./sequels/VJumpSequel";
import { VItemSellDialog } from "./dialogs/VItemSellDialog";
import { SItemSellDialog } from "../system/dialogs/SItemSellDialog";
import { SItemSelectionDialog } from "../system/dialogs/SItemSelectionDialog";
import { VItemSelectionDialog } from "./dialogs/VItemSelectionDialog";

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


        this._visualSequelFactory[MRBasics.sequels.idle] = () => new VIdleSequel();
        this._visualSequelFactory[MRBasics.sequels.MoveSequel] = () => new REVisualSequel_Move();
        this._visualSequelFactory[MRBasics.sequels.blowMoveSequel] = () => new VBlowMoveSequel();
        this._visualSequelFactory[MRBasics.sequels.dropSequel] = () => new VDropSequel();
        this._visualSequelFactory[MRBasics.sequels.attack] = () => new VAttackSequel();
        this._visualSequelFactory[MRBasics.sequels.CollapseSequel] = () => new VCollapseSequel();
        this._visualSequelFactory[MRBasics.sequels.commonStopped] = () => new VCommonStoppedSequel();
        this._visualSequelFactory[MRBasics.sequels.asleep] = () => new VAsleepSequel();
        this._visualSequelFactory[MRBasics.sequels.escape] = () => new VEscapeSequel();
        this._visualSequelFactory[MRBasics.sequels.earthquake2] = () => new VEarthquake2Sequel();
        this._visualSequelFactory[MRBasics.sequels.useItem] = () => new VUseItemSequel();
        this._visualSequelFactory[MRBasics.sequels.explosion] = () => new VExplosionSequel();
        this._visualSequelFactory[MRBasics.sequels.down] = () => new VDownSequel();
        this._visualSequelFactory[MRBasics.sequels.warp] = () => new VWarpSequel();
        this._visualSequelFactory[MRBasics.sequels.stumble] = () => new VStumbleSequel();
        this._visualSequelFactory[MRBasics.sequels.jump] = () => new VJumpSequel();

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
        else if (model instanceof SFeetDialog)
            this._dialogNavigator._openDialog(new VFeetDialog(model));
        else if (model instanceof SItemListDialog)
            this._dialogNavigator._openDialog(new VItemListDialog(model));
        else if (model instanceof SItemSelectionDialog)
            this._dialogNavigator._openDialog(new VItemSelectionDialog(model));
        else if (model instanceof SDetailsDialog)
            this._dialogNavigator._openDialog(new VDetailsDialog(model));
        else if (model instanceof SItemSellDialog)
            this._dialogNavigator._openDialog(new VItemSellDialog(model));
            

            
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

