
import { assert } from "ts/re/Common";
import { REGame } from "../objects/REGame";
import { LEntity } from "../objects/LEntity";
import { SCommandContext } from "./SCommandContext";
import { ActivityRecordingCommandType } from "./SActivityRecorder";
import { RESystem } from "./RESystem";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { SDialog } from "./SDialog";
import { SActivityPlaybackDialog } from "./dialogs/SActivityPlaybackDialog";

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
        dialog._openedFloorId = REGame.map.floorId().clone();
        this._dialogs.push(dialog);
        RESystem.integration.openDialog(dialog);
    }

    private pop(): void {
        const dialogIsPlaybck = this.activeDialog() instanceof SActivityPlaybackDialog;
        const otherFloorOpened = !this.activeDialog()._openedFloorId.equals(REGame.map.floorId());

        this._dialogs.pop();

        if (this._dialogs.length == 0) {
            
            if (REGame.recorder.isRecording()) {
                if (dialogIsPlaybck) {
                    // SCommandPlaybackDialog が最後のコマンドを実行し終えた時に備える。
                    // ここで記録してしまうと、回想が終わるたびに "待機" が増えてしまう。
                }
                else if (otherFloorOpened) {
                    
                }
                else {
                    REGame.recorder.push({
                        type: ActivityRecordingCommandType.CloseMainDialog,
                        activity: null,
                    });
                }
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
                type: ActivityRecordingCommandType.Activity,
                activity: activity.toData(),
            });
        }
    }
    
    _closeDialog() {
        this.pop();
        RESystem.integration.dialogClosed(this);
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
            RESystem.integration.updateDialog(this);
        }
        //REGame.recorder._recording = false;

        //if (this._visual) {
        //    this._visual.onUpdate(this);
        //}
    }
}

