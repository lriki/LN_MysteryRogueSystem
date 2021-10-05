
import { SManualActionDialog } from "ts/re/system/dialogs/SManualDecisionDialog";
import { Vector2 } from "ts/re/math/Vector2";
import { REDialogVisualNavigator } from "ts/re/visual/dialogs/REDialogVisual";
import { VManualActionDialogVisual } from "ts/re/visual/dialogs/VManualActionDialogVisual";
import { REVisualSequel } from "ts/re/visual/REVisualSequel";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/re/system/RESystem";
import { VCollapseSequel } from "./sequels/CollapseSequel";
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
import { SEventExecutionDialog } from "ts/re/system/dialogs/EventExecutionDialog";
import { VDropSequel } from "./sequels/VDropSequel";
import { SMainMenuDialog } from "ts/re/system/dialogs/SMainMenuDialog";
import { VMainMenuDialog } from "./dialogs/VMenuDialog";
import { SDialogContext } from "ts/re/system/SDialogContext";
import { LFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
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
import { REBasics } from "../data/REBasics";
import { VWarpSequel } from "./sequels/VWarpSequel";

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


        this._visualSequelFactory[REBasics.sequels.idle] = () => new VIdleSequel();
        this._visualSequelFactory[REBasics.sequels.MoveSequel] = () => new REVisualSequel_Move();
        this._visualSequelFactory[REBasics.sequels.blowMoveSequel] = () => new VBlowMoveSequel();
        this._visualSequelFactory[REBasics.sequels.dropSequel] = () => new VDropSequel();
        this._visualSequelFactory[REBasics.sequels.attack] = () => new VAttackSequel();
        this._visualSequelFactory[REBasics.sequels.CollapseSequel] = () => new VCollapseSequel();
        this._visualSequelFactory[REBasics.sequels.commonStopped] = () => new VCommonStoppedSequel();
        this._visualSequelFactory[REBasics.sequels.asleep] = () => new VAsleepSequel();
        this._visualSequelFactory[REBasics.sequels.escape] = () => new VEscapeSequel();
        this._visualSequelFactory[REBasics.sequels.earthquake2] = () => new VEarthquake2Sequel();
        this._visualSequelFactory[REBasics.sequels.useItem] = () => new VUseItemSequel();
        this._visualSequelFactory[REBasics.sequels.explosion] = () => new VExplosionSequel();
        this._visualSequelFactory[REBasics.sequels.down] = () => new VDownSequel();
        this._visualSequelFactory[REBasics.sequels.warp] = () => new VWarpSequel();

        
        
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
        else if (model instanceof SDetailsDialog)
            this._dialogNavigator._openDialog(new VDetailsDialog(model));
            

            
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

