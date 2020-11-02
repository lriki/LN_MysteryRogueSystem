import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisual } from "ts/visual/REDialogVisual";
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

/**
 */
export class REVisual_Manager
{
    //private _dialogVisual: REDialogVisual | null;
    private _tileSize: Vector2 = new Vector2(48, 48);
    private _visualSequelFactory: (() => REVisualSequel)[] = [];
    
    constructor() {
        //this._dialogVisual = null;


        this._visualSequelFactory[REData.MoveSequel] = () => new REVisualSequel_Move();
    }

    tileSize(): Vector2 {
        return this._tileSize;
    }

    _finalize() {
        REGame.map.signalEntityEntered = undefined;
        REGame.map.signalEntityLeaved = undefined;
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

    handleDialogOpend(context: REDialogContext): REDialogVisual | undefined {
        //assert(!this._dialogVisual);
        const d = context.dialog();
        if (d instanceof REManualActionDialog)
            return new REManualActionDialogVisual();
        // AI 用の Dialog を開いた時など、UI を伴わないものもある
        return undefined;
    }

    handleDialogClosed(context: REDialogContext) {
        //if (this._dialogVisual) {
        //    this._dialogVisual.onClose();
        //    this._dialogVisual = null;
        //}
    }

}

