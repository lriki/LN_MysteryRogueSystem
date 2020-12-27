
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisualNavigator } from "ts/visual/REDialogVisual";
import { REManualActionDialogVisual } from "ts/visual/dialogs/REManualActionDialogVisual";
import { REVisualSequel } from "ts/visual/REVisualSequel";
import { REDialogContext } from "../system/REDialog";
import { REGame_Sequel } from "../objects/REGame_Sequel";
import { RE } from "ts/dialogs/EventExecutionDialog";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/system/RESystem";
import { VCollapseSequel } from "./sequels/CollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";
import { VBlowMoveSequel } from "./sequels/VBlowMoveSequel";
import { REVisualSequel_Move } from "./sequels/VMoveSequel";

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


        this._visualSequelFactory[RESystem.sequels.MoveSequel] = () => new REVisualSequel_Move();
        this._visualSequelFactory[RESystem.sequels.blowMoveSequel] = () => new VBlowMoveSequel();
        this._visualSequelFactory[RESystem.sequels.attack] = () => new VAttackSequel();
        this._visualSequelFactory[RESystem.sequels.CollapseSequel] = () => new VCollapseSequel();
    }

    tileSize(): Vector2 {
        return this._tileSize;
    }

    _finalize() {
    }

    createVisualSequel(sequel: REGame_Sequel): REVisualSequel {
        const factory = this._visualSequelFactory[sequel.sequelId()];
        if (factory) {
            return factory();
        }
        else {
            throw new Error();
        }
    }

    openDialog(context: REDialogContext): void {
        console.log("!! openDialog");
        const d = context.dialog();
        if (d instanceof REManualActionDialog)
            this._dialogNavigator.push(new REManualActionDialogVisual());
        else if (d instanceof RE.EventExecutionDialog)
            this._dialogNavigator.push(new REEventExecutionDialogVisual());

        // AI 用の Dialog を開いた時など、UI を伴わないものもある
        //return undefined;
    }

    closeDialog(context: REDialogContext) {
        this._dialogNavigator.clear();
        //if (this._dialogVisual) {
        //    this._dialogVisual.onClose();
        //    this._dialogVisual = null;
        //}
    }

}

