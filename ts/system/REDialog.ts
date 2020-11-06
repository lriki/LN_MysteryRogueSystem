
import { assert } from "ts/Common";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
//import { REDialogVisual } from "ts/visual/REDialogVisual";
import { RECommand, REResponse } from "./RECommand";
import { RECommandContext } from "./RECommandContext";
import { RERecordingCommandType } from "./RECommandRecorder";
import { REScheduler } from "./REScheduler";
import { RESystem } from "./RESystem";

export class REDialogContext
{
    private _owner: REScheduler;
    private _commandContext: RECommandContext;
    private _causeEntity: REGame_Entity | undefined;
    private _dialogModel: REDialog | null;
    //_visual: REDialogVisual | undefined;

    constructor(owner: REScheduler, commandContext: RECommandContext) {
        this._owner = owner;
        this._commandContext = commandContext;
        this._dialogModel = null;
    }

    causeEntity(): REGame_Entity | undefined {
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

    
    postAction(actionId: number, actor: REGame_Entity, reactor: REGame_Entity | undefined, args?: any) {
        this._commandContext.postAction(actionId, actor, reactor, args);
        
        if (REGame.recorder.isRecording()) {
            REGame.recorder.push({
                type: RERecordingCommandType.Action,
                data: {
                    actionId: actionId,
                    actorEntityId: actor.id(),
                    reactorEntityId: (reactor) ? reactor.id() : 0,
                    args: args,
                }
            });
        }
        
    }

    closeDialog(consumeAction: boolean) {
        if (consumeAction && this._causeEntity) {
            //this._owner.consumeActionToken(this._causeEntity);
            this._commandContext.postConsumeActionToken(this._causeEntity);
            
            if (REGame.recorder.isRecording()) {
                REGame.recorder.push({
                    type: RERecordingCommandType.ConsumeActionToken,
                    data: {
                        entityId: this._causeEntity.id(),
                    }
                });
            }
        
        }
        this._owner._closeDialogModel();
        this._commandContext._next();
    }

    setCauseEntity(value: REGame_Entity) {
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
        RESystem.integration.onUpdateDialog(this);
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
}
