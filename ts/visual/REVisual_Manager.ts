
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisualNavigator } from "ts/visual/dialogs/REDialogVisual";
import { VManualActionDialogVisual } from "ts/visual/dialogs/REManualActionDialogVisual";
import { REVisualSequel } from "ts/visual/REVisualSequel";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/system/RESystem";
import { VCollapseSequel } from "./sequels/CollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";
import { VBlowMoveSequel } from "./sequels/VBlowMoveSequel";
import { REVisualSequel_Move } from "./sequels/VMoveSequel";
import { LWarehouseDialog } from "ts/dialogs/LWarehouseDialog";
import { VWarehouseDialog } from "./dialogs/VWarehouseDialog";
import { DSequel, DSequelId } from "ts/data/DSequel";
import { VIdleSequel } from "./sequels/VIdleSequel";
import { REData } from "ts/data/REData";
import { VAsleepSequel } from "./sequels/VAsleepSequel";
import { VCommonStoppedSequel } from "./sequels/VCommonStoppedSequel";
import { REEventExecutionDialog } from "ts/dialogs/EventExecutionDialog";
import { VDropSequel } from "./sequels/VDropSequel";
import { LMainMenuDialog } from "ts/dialogs/LMainMenuDialog";
import { VMenuDialog } from "./dialogs/VMenuDialog";
import { SDialogContext } from "ts/system/SDialogContext";

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

    openDialog(context: SDialogContext): void {
        const d = context.dialog();
        if (d instanceof REManualActionDialog)
            this._dialogNavigator._openMainDialog(new VManualActionDialogVisual(d));
        else if (d instanceof REEventExecutionDialog)
            this._dialogNavigator.push(new REEventExecutionDialogVisual());
        else if (d instanceof LWarehouseDialog)
            this._dialogNavigator._openMainDialog(new VWarehouseDialog(d));
        //else if (d instanceof LMainMenuDialog)
        //    this._dialogNavigator._openMainDialog(new VMenuDialog(d));

            
        // AI 用の Dialog を開いた時など、UI を伴わないものもある
        //return undefined;
    }

    closeDialog(context: SDialogContext) {
        this._dialogNavigator.clear();
        //if (this._dialogVisual) {
        //    this._dialogVisual.onClose();
        //    this._dialogVisual = null;
        //}
    }

}

