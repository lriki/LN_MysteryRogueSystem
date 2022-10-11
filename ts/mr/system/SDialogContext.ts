
import { assert } from "ts/mr/Common";
import { MRLively } from "../lively/MRLively";
import { LEntity } from "../lively/LEntity";
import { SCommandContext } from "./SCommandContext";
import { ActivityRecordingCommandType } from "./SActivityRecorder";
import { MRSystem } from "./MRSystem";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SDialog } from "./SDialog";
import { SActivityPlaybackDialog } from "./dialogs/SActivityPlaybackDialog";

export class SDialogContext
{
    private _commandContext: SCommandContext;
    private _causeEntity: LEntity | undefined;
    //private _dialogModel: REDialog | null;
    //_visual: REDialogVisual | undefined;
    private _dialogs: SDialog[];

    constructor(cctx: SCommandContext) {
        this._commandContext = cctx;
        this._dialogs = [];
    }

    public open(dialog: SDialog): void {
        dialog._openedFloorId = MRLively.map.floorId().clone();
        this._dialogs.push(dialog);
        MRSystem.integration.openDialog(dialog);
    }

    private pop(): void {
        const dialogIsPlaybck = this.activeDialog() instanceof SActivityPlaybackDialog;
        const otherFloorOpened = !this.activeDialog()._openedFloorId.equals(MRLively.map.floorId());

        this._dialogs.pop();

        if (this._dialogs.length == 0) {
            
            if (MRLively.recorder.isRecording()) {
                if (dialogIsPlaybck) {
                    // SCommandPlaybackDialog が最後のコマンドを実行し終えた時に備える。
                    // ここで記録してしまうと、回想が終わるたびに "待機" が増えてしまう。
                }
                else if (otherFloorOpened) {
                    
                }
                else {
                    MRLively.recorder.push({
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

        if (MRLively.recorder.isRecording()) {
            MRLively.recorder.push({
                type: ActivityRecordingCommandType.Activity,
                activity: activity.toData(),
            });
        }
    }
    
    _closeDialog(dialog: SDialog) {
        assert(this.activeDialog() == dialog);  // TODO: stack ぜんぶ見て、見つかったものをその子を close したほうがいいかも？
        this.pop();
        MRSystem.integration.dialogClosed(this, dialog);
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

        if (this._hasDialogModel() &&   // dialog.onUpdate() の中で submit が走り、Dialog が閉じられることに備える
            dialog.isVisualIntegration()) {
            MRSystem.integration.updateDialog(this);
        }
        //REGame.recorder._recording = false;

        //if (this._visual) {
        //    this._visual.onUpdate(this);
        //}
    }
}

