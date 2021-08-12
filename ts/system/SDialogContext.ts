
import { assert } from "ts/Common";
import { REGame } from "../objects/REGame";
import { LEntity } from "../objects/LEntity";
import { SCommandContext } from "./SCommandContext";
import { RERecordingCommandType } from "./RECommandRecorder";
import { RESystem } from "./RESystem";
import { LActivity } from "ts/objects/activities/LActivity";
import { SDialog } from "./SDialog";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";

export class SDialogContext
{
    private _commandContext: SCommandContext;
    private _causeEntity: LEntity | undefined;
    //private _dialogModel: REDialog | null;
    //_visual: REDialogVisual | undefined;
    private _dialogs: SDialog[];

    constructor(commandContext: SCommandContext) {
        this._commandContext = commandContext;
        this._dialogs = [];
    }

    public open(dialog: SDialog): void {
        this._dialogs.push(dialog);
        RESystem.integration.onOpenDialog(dialog);
    }

    private pop(): void {
        this._dialogs.pop();

        if (this._dialogs.length == 0) {
            
            if (REGame.recorder.isRecording()) {
                REGame.recorder.push({
                    type: RERecordingCommandType.CloseMainDialog,
                    activity: null,
                });
            }
        }
    }

    public dialogs(): readonly SDialog[] {
        return this._dialogs;
    }

    public activeDialog(): SDialog {
        assert(this._hasDialogModel());
        return this._dialogs[this._dialogs.length - 1]; 
    }

    causeEntity(): LEntity | undefined {
        return this._causeEntity;
    }

    /*
    dialog(): REDialog {
        if (this._dialogModel)
            return this._dialogModel;
        else
            throw new Error("_dialogModel");
    }
    */

    commandContext(): SCommandContext {
        return this._commandContext;
    }

    public postActivity(activity: LActivity): void {
        this._commandContext.postActivity(activity);

        if (REGame.recorder.isRecording()) {
            REGame.recorder.push({
                type: RERecordingCommandType.Activity,
                activity: activity,
            });
        }
    }
    
    _closeDialog() {
        this.pop();
        RESystem.integration.onDialogClosed(this);
    }

    /**
     * 移動後のアイテム拾いや矢弾の装備など、ターンを消費しないが、一度コマンドチェーンを実行したいときに使う。
     */
    /*
    public postReopen(): void {
        const entity = this.causeEntity();
        const model = this.activeDialog();

        this.closeDialog();

        assert(entity);
        this._commandContext.openDialog(entity, model, true);
    }
    */

    setCauseEntity(value: LEntity) {
        this._causeEntity = value;
    }

    //_setDialogModel(value: REDialog | null) {
    //    this._dialogModel = value;
    //}

    _hasDialogModel(): boolean {
        return this._dialogs.length > 0;
    }

    _update() {
        assert(this._hasDialogModel());

        //REGame.recorder._recording = true;
        const dialog = this.activeDialog();
        dialog.onUpdate(this);

        if (dialog.isVisualIntegration()) {
            RESystem.integration.onUpdateDialog(this);
        }
        //REGame.recorder._recording = false;

        //if (this._visual) {
        //    this._visual.onUpdate(this);
        //}
    }
}

