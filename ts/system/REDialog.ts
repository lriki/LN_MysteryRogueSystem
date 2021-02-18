
import { assert } from "ts/Common";
import { REGame } from "../objects/REGame";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { REGame_Entity } from "../objects/REGame_Entity";
import { RECommandContext } from "./RECommandContext";
import { RERecordingCommandType } from "./RECommandRecorder";
import { REScheduler } from "./REScheduler";
import { RESystem } from "./RESystem";

export class REDialogContext
{
    private _commandContext: RECommandContext;
    private _causeEntity: REGame_Entity | undefined;
    private _dialogModel: REDialog | null;
    //_visual: REDialogVisual | undefined;

    constructor(commandContext: RECommandContext) {
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
        //this._commandContext.postActionTwoWay(actionId, actor, reactor, args);
        this._commandContext.postActionOneWay(actionId, actor, reactor, undefined, args);
        
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
            // RMMZイベント起動Dialog では、causeEntity が「階段Entity」等になることがある。
            // 行動順が回らない Entity の ActionToken を消費することはできないのでガードする。
            if (this._causeEntity.findAttribute(LUnitAttribute)) {
                this._commandContext.postConsumeActionToken(this._causeEntity);
            }
            
            if (REGame.recorder.isRecording()) {
                REGame.recorder.push({
                    type: RERecordingCommandType.ConsumeActionToken,
                    data: {
                        entityId: this._causeEntity.id(),
                    }
                });
            }
        
        }
        this._setDialogModel(null);
        REGame.integration.onDialogClosed(this);
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
        REGame.integration.onUpdateDialog(this);
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

    public close(consumeAction: boolean): void {
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
}
