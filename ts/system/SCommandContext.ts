import { checkContinuousResponse, RECommand, REResponse } from "./RECommand";
import { SDialog } from "./SDialog";
import { LEntity } from "../objects/LEntity";
import { assert, Log } from "ts/Common";
import { SAnumationSequel, SMotionSequel, SWaitSequel } from "../objects/REGame_Sequel";
import { REGame } from "../objects/REGame";
import { SEffectContext, SEffectSubject } from "./SEffectContext";
import { LBlock } from "../objects/LBlock";
import { RESystem } from "./RESystem";
import { DSkillDataId } from "ts/data/DSkill";
import { CommandArgs, LBehavior } from "ts/objects/behaviors/LBehavior";
import { SSequelContext } from "./SSequelContext";
import { LCommandPlaybackDialog } from "ts/system/dialogs/LCommandPlaybackDialog";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";

interface RECCMessage {
    name: string;   // for debug
    func: () => REResponse;
}

export type CommandResultCallback = (response: REResponse, reactor: LEntity, context: SCommandContext) => void;

/**
 * 
 * 
 */
export class SCommandContext
{
    private _sequelContext: SSequelContext;
    private _visualAnimationWaiting: boolean = false;   // 不要かも
    private _recodingCommandList: RECCMessage[] = [];
    private _runningCommandList: RECCMessage[] = [];
    private _afterChainCommandList: RECCMessage[] = [];
    private _messageIndex: number = 0;
    private _lastActorResponce: REResponse = REResponse.Pass;
    private _lastReactorResponce: REResponse = REResponse.Pass;
    private _commandChainRunning: boolean = false;

    constructor(sequelContext: SSequelContext) {
        this._sequelContext = sequelContext;
    }

    // マップ切り替え時に実行
    clear() {
        this._visualAnimationWaiting = false;
        
        this._recodingCommandList = [];
        this._runningCommandList = [];
        this._messageIndex = 0;
        this._lastActorResponce = REResponse.Pass;
        this._lastReactorResponce = REResponse.Pass;
        this._commandChainRunning = false;
    }
    
    /**
     * カスタムの RE-Command のように、プラグインとして事前定義できないコマンド実行 Action の呼び出し
     */
    postActionOneWay(actionId: number, actor: LEntity, reactor: LEntity | undefined, effectContext: SEffectContext | undefined, args?: any) {
        assert(actionId > 0);
        
        const actualCommand = new RECommand(actionId, actor, reactor, effectContext, args);

        const m3 = () => {
            Log.doCommand("Action");
            return actor._sendAction(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendAction", func: m3 });

        Log.postCommand("ActionOneWay");
    }

    public postActivity(activity: LActivity) {
        const m1 = () => {
            Log.doCommand("Activity");
            return activity.subject()._sendActivity(this, activity);
        };
        this._recodingCommandList.push({ name: "Activity", func: m1 });

        Log.postCommand("Activity");
    }

    // TODO: sender っていうのがすごくわかりづらい。
    // target と sender は基本的に self で同一なのでそうして、
    // こうかてきようさきにしたいものを target として引数整理したほうがよさそう。
    post<TSym extends symbol>(target: LEntity, sender: LEntity, subject: SEffectSubject, args: any, symbol: TSym, result?: CommandResultCallback): void {
        const m1 = () => {
            const response = target._callBehaviorIterationHelper((behavior: LBehavior) => {
                const func = (behavior as any)[symbol];
                if (func) {
                    const args2: CommandArgs = { self: target, sender: sender, subject: subject, args: args };
                    const r1 = func.call(behavior, args2, this);
                    //if (r1 != REResponse.Pass) {
                        // 何らかの形でコマンドが処理された
                    //    if (result) {
                    //        result(r1, target, this);
                    //    }
                    //}
                    return r1;
                }
                else {
                    return REResponse.Pass;
                }
            });

            //if (response == REResponse.Pass) {
                //// コマンドが処理されなかった
                if (result) {
                    result(response, target, this);
                }
            //}

            return REResponse.Succeeded;

        };
        this._recodingCommandList.push({ name: "Post", func: m1 });
        Log.postCommand("Post");
    }

    postCall(func: () => void): void {
        const m1 = () => {
            Log.doCommand("Call");
            func();
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Call", func: m1 });
        Log.postCommand("Call");
    }

    findReactorEntityInBlock(block: LBlock, actionId: number): LEntity | undefined {
        const layers = block.layers();
        for (let iLayer = layers.length - 1; iLayer >= 0; iLayer--) {   // 上の Layer から
            const reactor = layers[iLayer].entities().find(entity => entity.queryReactions().find(x => x == actionId) != undefined);
            if (reactor) return reactor;
        }
        return undefined;
    }

    openDialog(causeEntity: LEntity, dialogModel: SDialog, afterChain: boolean): void {
        const m1 = () => {
            Log.doCommand("OpenDialog");
            
            RESystem.dialogContext.setCauseEntity(causeEntity);

            if (REGame.recorder.isPlayback()) {
                RESystem.dialogContext.open(new LCommandPlaybackDialog());
            }
            else {
                RESystem.dialogContext.open(dialogModel);
            }

            return REResponse.Succeeded;
        };

        if (afterChain)
            this._afterChainCommandList.push({ name: "openDialog", func: m1 });
        else
            this._recodingCommandList.push({ name: "openDialog", func: m1 });
        Log.postCommand("openDialog");
    }

    postSequel(entity: LEntity, sequelId: number, args?: any) {
        assert(sequelId > 0);
        const m1 = () => {
            Log.doCommand("Sequel");
            this._sequelContext.addSequel(new SMotionSequel(entity, sequelId, args));
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Sequel", func: m1 });
        Log.postCommand("Sequel");
    }
    
    // 動きを伴わず、Animation だけ表示するのに使う。 Sequel 作るまでもないものとか。
    postAnimation(entity: LEntity, animationId: number, wait: boolean) {
        if (animationId <= 0) return;

        const m1 = () => {
            Log.doCommand("Animation");
            this._sequelContext.addSequel(new SAnumationSequel(entity, animationId, wait));
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Animation", func: m1 });
        Log.postCommand("Animation");
    }

    postWaitSequel() {
        const m1 = () => {
            Log.doCommand("WaitSequel");
            this._sequelContext.flushSequelSet();
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "WaitSequel", func: m1 });
        Log.postCommand("WaitSequel");
    }

    public postWait(entity: LEntity, waitCount: number) {
        const m1 = () => {
            Log.doCommand("Wait");
            this._sequelContext.addSequel(new SWaitSequel(entity, waitCount));
            this._visualAnimationWaiting = true;
            //REGame.scheduler.setWaitCount(frameCount);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Wait", func: m1 });
        Log.postCommand("Wait");
    }

    public postApplyEffect(target: LEntity, context: SCommandContext, effect: SEffectContext): void {
        const m1 = () => {
            for (const b of target.collectBehaviors()) {
                const r = b.onApplyEffect(target, this, effect);
                if (!checkContinuousResponse(r)) {
                    return r;
                }
            }
            return REResponse.Pass;
        };
        this._recodingCommandList.push({ name: "ApplyEffect", func: m1 });
        Log.postCommand("ApplyEffect");
    }

    postDestroy(entity: LEntity) {
        const m1 = () => {
            Log.doCommand("Destroy");
            entity.destroy();
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Destroy", func: m1 });
        Log.postCommand("Destroy");
    }

    postMessage(text: string) {
        const m1 = () => {
            Log.doCommand("Message");
            REGame.messageHistory.add(text);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Message", func: m1 });
        Log.postCommand("Message");
    }

    /**
     * フロア移動
     * @param entity 
     * @param floorId 
     * @param x 
     * @param y 
     * @param d 
     */
    postTransferFloor(entity: LEntity, floorId: LFloorId, x: number = 0, y:number = 0, d: number = 0) {
        const m1 = () => {
            Log.doCommand("TransferFloor");
            REGame.world._transferEntity(entity, floorId, x, y);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "TransferFloor", func: m1 });
        Log.postCommand("TransferFloor");
    }
    
    /*
    public postTransferRMMZMap(entity: LEntity, mapId: number, x: number = 0, y:number = 0, d: number = 0) {
        const m1 = () => {
            Log.doCommand("TransferFloor");
            RESystem.integration.onReserveTransferMap(mapId, x, y, d);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "TransferFloor", func: m1 });
        Log.postCommand("TransferFloor");
    }
    */

    postConsumeActionToken(entity: LEntity): void {
        const behavior = entity.findBehavior(REUnitBehavior);
        assert(behavior);

        const m1 = () => {
            Log.doCommand("ConsumeActionToken");
            
            behavior.setActionTokenCount(behavior.actionTokenCount() - 1);  // ここで借金することもあり得る
            entity._actionConsumed = true;

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "ConsumeActionToken", func: m1 });
        Log.postCommand("ConsumeActionToken");
    }

    postSkipPart(entity: LEntity): void {
        const behavior = entity.findBehavior(REUnitBehavior);
        assert(behavior);

        const m1 = () => {
            Log.doCommand("SkipPart");
            
            behavior.clearActionTokenCount();
            entity._actionConsumed = true;

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "SkipPart", func: m1 });
        Log.postCommand("SkipPart");
    }

    postPerformSkill(performer: LEntity, skillId: DSkillDataId): void {
        const m1 = () => {
            Log.doCommand("PerformSkill");
            RESystem.skillBehaviors[skillId].onPerforme(skillId, performer, this);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "PerformSkill", func: m1 });
        Log.postCommand("PerformSkill");
    }

    // Skill や Item などの効果適用。
    // MP cost など発動可能判定は呼び出す前に済ませること。
    /*
    postApplyEffect(context: REEffectContext): void {
        const m1 = () => {
            Log.doCommand("ApplyEffect");
            // TODO:
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "ApplyEffect", func: m1 });
        Log.postCommand("ApplyEffect");
    }
    */

    /*
    postRemoveFromWhereabouts(entity: REGame_Entity, result: CommandResultCallback): void {
        const m1 = () => {
            Log.doCommand("RemoveFromWhereabouts");
            const response = entity.callRemoveFromWhereabouts(this);
            result(response, entity, this);
            return response;
        };
        this._recodingCommandList.push({ name: "RemoveFromWhereabouts", func: m1 });
        Log.postCommand("RemoveFromWhereabouts");
    }
    */



    visualAnimationWaiting(): boolean {
        return this._visualAnimationWaiting;
    }

    clearVisualAnimationWaiting(): void {
        this._visualAnimationWaiting = false;
    }
    
    isRunning(): boolean {
        return this._messageIndex < this._runningCommandList.length || this._recodingCommandList.length != 0 || this._afterChainCommandList.length != 0;
    }

    isRecordingListEmpty(): boolean {
        return this._recodingCommandList.length == 0;
    }

    isEmpty(): boolean {
        return !this.isRunning() && this.isRecordingListEmpty();
    }

    /*
    _process(): boolean {
        if (this.isRunning()) {
            // コマンドリスト実行中
            this._processCommand();
            
            if (!this.isRunning()) {
                // 実行終了。
                this._owner.
            }
        }

        
        if (!this.isRunning() && this._recodingCommandList.length > 0) {
            // _runningCommandList は終了したが、_recodingCommandList に次のコマンドチェーンが溜まっていればそれの実行を始める
            this._submit();
        }

        // _runningCommandList にも _recodingCommandList にもコマンドが無ければ false を返して、スケジューリングフェーズを次に進める
        return this.isRunning();
    }
    */

    _processCommand() {
        if (this._messageIndex >= this._runningCommandList.length) {
            if (this._recodingCommandList.length > 0 || this._afterChainCommandList.length > 0) {
                this._submit();
            }
        }


        if (this.isRunning()) {
            const message = this._runningCommandList[this._messageIndex];
            const response = message.func();
    
            //if (RESystem.dialogContext._hasDialogModel()) {
                // もし command の実行で Dialog が表示されたときは index を進めない。
                // Dialog が閉じたときに進める。
            //}
            //else {
                this._next();
            //}
        }
    }

    _next() {
        assert(this._commandChainRunning);
        this._messageIndex++;

        if (this._messageIndex >= this._runningCommandList.length) {
            this._commandChainRunning = false;
            Log.d("<<<<[End CommandChain]");

            // CommandChain 中に post されたものがあれば、続けて swap して実行開始してみる
            if (this._recodingCommandList.length > 0 || this._afterChainCommandList.length > 0) {
                this._submit();
            }
        }
    }

    // Decision の後に実行する
    _submit() {
        assert(!this._commandChainRunning);

        // swap
        [this._runningCommandList, this._recodingCommandList] = [this._recodingCommandList, this._runningCommandList];

        // clear
        this._recodingCommandList.splice(0);
        this._messageIndex = 0;

        if (this._runningCommandList.length > 0) {
            Log.d(">>>>[Start CommandChain]");
            this._commandChainRunning = true;
            //this.dumpCommands();
        }
        else if (this._afterChainCommandList.length > 0) {
            [this._runningCommandList, this._afterChainCommandList] = [this._afterChainCommandList, this._runningCommandList];
            this._afterChainCommandList.splice(0);
            this._commandChainRunning = true;
        }
    }

    dumpCommands() {
        console.log("Commands:");
        this._runningCommandList.forEach(x => {
            console.log("  " + x.name);
        });
    }

}


