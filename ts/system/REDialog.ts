
import { assert } from "ts/Common";
import { REGame } from "../objects/REGame";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { LEntity } from "../objects/LEntity";
import { RECommandContext } from "./RECommandContext";
import { RERecordingCommandType } from "./RECommandRecorder";
import { SScheduler } from "./SScheduler";
import { RESystem } from "./RESystem";
import { LCommandPlaybackDialog } from "ts/dialogs/LCommandPlaybackDialog";
import { LActivity } from "ts/objects/activities/LActivity";

export class REDialogContext
{
    private _commandContext: RECommandContext;
    private _causeEntity: LEntity | undefined;
    private _dialogModel: REDialog | null;
    //_visual: REDialogVisual | undefined;

    constructor(commandContext: RECommandContext) {
        this._commandContext = commandContext;
        this._dialogModel = null;
    }

    causeEntity(): LEntity | undefined {
        return this._causeEntity;
    }

    dialog(): REDialog {
        if (this._dialogModel)
            return this._dialogModel;
        else
            throw new Error("_dialogModel");
    }

    commandContext(): RECommandContext {
        return this._commandContext;
    }

    public postActivity(target: LEntity, activity: LActivity): void {
        this._commandContext.postActivity(target, activity);
    }

    postAction(actionId: number, actor: LEntity, reactor: LEntity | undefined, args?: any) {
        //this._commandContext.postActionTwoWay(actionId, actor, reactor, args);
        this._commandContext.postActionOneWay(actionId, actor, reactor, undefined, args);
        
        if (REGame.recorder.isRecording()) {
            REGame.recorder.push({
                type: RERecordingCommandType.Action,
                data: {
                    actionId: actionId,
                    actorEntityId: actor.entityId(),
                    reactorEntityId: (reactor) ? reactor.entityId() : 0,
                    args: args,
                }
            });
        }
        
    }

    closeDialog(consumeAction: boolean) {
        if (consumeAction && this._causeEntity) {
            // RMMZイベント起動Dialog では、causeEntity が「階段Entity」等になることがある。
            // 行動順が回らない Entity の ActionToken を消費することはできないのでガードする。
            if (this._causeEntity.findAttribute(LUnitAttribute)) {
                this._commandContext.postConsumeActionToken(this._causeEntity);
            }
            
            if (REGame.recorder.isRecording()) {
                REGame.recorder.push({
                    type: RERecordingCommandType.ConsumeActionToken,
                    data: {
                        entityId: this._causeEntity.entityId(),
                    }
                });
            }
        
        }
        this._setDialogModel(null);
        RESystem.integration.onDialogClosed(this);
        this._commandContext._next();
    }

    setCauseEntity(value: LEntity) {
        this._causeEntity = value;
    }

    _setDialogModel(value: REDialog | null) {
        this._dialogModel = value;
    }

    _hasDialogModel(): boolean {
        return this._dialogModel !== null;
    }

    _update() {
        assert(this._dialogModel !== null);

        //REGame.recorder._recording = true;
        this._dialogModel.onUpdate(this);

        if (this._dialogModel && this._dialogModel.isVisualIntegration()) {
            RESystem.integration.onUpdateDialog(this);
        }
        //REGame.recorder._recording = false;

        //if (this._visual) {
        //    this._visual.onUpdate(this);
        //}
    }
}


/**
 * GameDialog
 *
 * Dialog と名前がついているが、必ずしも UI を持つものではない。
 * 名前通り、エンドユーザーとの「対話」のためのインターフェイスを実装する。
 */
export class REDialog
{
    onUpdate(context: REDialogContext): void { }

    public isVisualIntegration(): boolean {
        return true;
    }

    public close(consumeAction: boolean): void {
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
}
