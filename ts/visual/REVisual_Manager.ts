import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisualNavigator } from "ts/visual/REDialogVisual";
import { REManualActionDialogVisual } from "ts/visual/REManualActionDialogVisual";
import { REVisualSequel, REVisualSequel_Move } from "ts/visual/REVisualSequel";
import { REDialogContext } from "../system/REDialog";
import { REGame } from "../RE/REGame";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_Sequel, RESequelSet } from "../RE/REGame_Sequel";
import { REVisual } from "./REVisual";
import { REVisual_Entity } from "./REVisual_Entity";
import { REVisualSequelManager } from "./REVisualSequelManager";
import { REDataManager } from "ts/data/REDataManager";
import { RE } from "ts/dialogs/EventExecutionDialog";
import { REEventExecutionDialogVisual } from "./dialogs/REEventExecutionDialogVisual";
import { RESystem } from "ts/system/RESystem";
import { VCollapseSequel } from "./sequels/CollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";

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
        //assert(!this._dialogVisual);
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

