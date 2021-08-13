import { checkContinuousResponse, REResponse } from "./RECommand";
import { SDialog } from "./SDialog";
import { LEntity } from "../objects/LEntity";
import { assert, Log } from "ts/Common";
import { SAnumationSequel, SBalloonSequel, SMotionSequel, SWaitSequel } from "./SSequel";
import { REGame } from "../objects/REGame";
import { SEffectContext, SEffectSubject } from "./SEffectContext";
import { LBlock } from "../objects/LBlock";
import { RESystem } from "./RESystem";
import { DSkillDataId } from "ts/data/DSkill";
import { CommandArgs, DecisionPhase, LBehavior } from "ts/objects/behaviors/LBehavior";
import { SSequelContext } from "./SSequelContext";
import { SActivityPlaybackDialog } from "ts/system/dialogs/SActivityPlaybackDialog";
import { LActivity } from "ts/objects/activities/LActivity";
import { LFloorId } from "ts/objects/LFloorId";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { LRandom } from "ts/objects/LRandom";
import { SEmittorPerformer } from "./SEmittorPerformer";
import { DEmittor } from "ts/data/DEffect";
import { DItem } from "ts/data/DItem";

export type MCEntryProc = () => REResponse;
export type CommandResultCallback = () => boolean;

/*
export class SMCResult {
    _result: REResponse = REResponse.Succeeded;

    public reject(): void {
        this._result = 
    }
}
*/

export class RECCMessageCommand {

    _name: string;   // for debug
    _entryFunc: MCEntryProc | undefined;
    _chainFunc: CommandResultCallback | undefined;
    _then: RECCMessageCommand | undefined;
    _rejected: RECCMessageCommand | undefined;
    
    _result: boolean;   // これは Behavior リストの成否ではなく Command の成否なので、Response 関係なし。普通の Promise と同様、二値。
    //_prev: RECCMessageCommand | undefined;

    constructor(name: string, entryFunc: MCEntryProc | undefined, chainFunc?: CommandResultCallback | undefined, prev?: RECCMessageCommand | undefined) {
        assert(!(entryFunc && chainFunc));
        this._name = name;
        this._entryFunc = entryFunc;
        this._chainFunc = chainFunc;
        this._result = true;
        //this._prev = prev;
    }

    public then(func: CommandResultCallback): RECCMessageCommand {
        assert(!this._then);
        this._then = new RECCMessageCommand("then", undefined, func);
        return this._then;
    }

    public rejected(func: CommandResultCallback): void {
        throw new Error("Not implemented.");
        assert(!this._rejected);
        this._rejected = new RECCMessageCommand("rejected", undefined, func);
        //return this._rejected;
    }

    public call(context: SCommandContext): void {
        
        if (this._entryFunc) {
            this._result = this._entryFunc() != REResponse.Canceled;
        }
        else if (this._chainFunc) {
            //assert(this._prev);
            //if (this._prev._result) {
                this._result = this._chainFunc();
           // }
        }

        if (this._entryFunc || this._chainFunc) {
            if (this._result) {
                if (this._then) {
                    this._then.call(context);
                    //context._recodingCommandList.push(this._then);
                }
            }
            else {
                if (this._rejected) {
                    this._rejected.call(context);
                    //context._recodingCommandList.push(this._then);
                }
            }
        }
    }
}


/**
 * 
 * 
 */
export class SCommandContext
{
    private _sequelContext: SSequelContext;
    private _visualAnimationWaiting: boolean = false;   // 不要かも
    _recodingCommandList: RECCMessageCommand[] = [];
    private _runningCommandList: RECCMessageCommand[] = [];
    private _afterChainCommandList: RECCMessageCommand[] = [];
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

    public random(): LRandom {
        return REGame.world.random();
    }


    postConsumeActionToken(entity: LEntity): void {
        const behavior = entity.findBehavior(LUnitBehavior);
        assert(behavior);

        // TODO: 今のところ借金する仕組みは無いので、そのように検証してみる。
        // あやつり系のモンスター特技を作るときには、別に借金を許可する consumeActionToken を作ったほうがいいかも。
        assert(entity.actionTokenCount() > 0);

        const m1 = () => {
            Log.doCommand("ConsumeActionToken");

            this.attemptConsumeActionToken(entity);
            

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("ConsumeActionToken", m1));
        Log.postCommand("ConsumeActionToken");
    }

    public postActivity(activity: LActivity) {
        const m1 = () => {
            Log.doCommand("Activity");

            if (activity.isConsumeAction()) {
                const entity = activity.subject();
                this.attemptConsumeActionToken(entity);
            }

            const r = activity.subject()._sendActivity(this, activity);
            if (r != REResponse.Canceled) { // TODO: ここ Succeeded のほうがいいかも
                if (activity.hasObject()) {
                    this.postCall(() => {
                        activity.object()._sendActivityReaction(this, activity);
                    });
                }
            }
            return r;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Activity", m1));

        Log.postCommand("Activity");
    }

    private attemptConsumeActionToken(entity: LEntity): void {

        // TODO: 今のところ借金する仕組みは無いので、そのように検証してみる。
        // あやつり系のモンスター特技を作るときには、別に借金を許可する consumeActionToken を作ったほうがいいかも。
        assert(entity.actionTokenCount() > 0);

        entity.setActionTokenCount(entity.actionTokenCount() - 1);  // ここで借金することもあり得る
        
            // ターンエンド
            {
                //const entity = REGame.scheduler.currentTurnEntity();
                //if (entity) {
                    // 風来のシレン Wiki の行動順ではそれぞれ Phase が分かれているように見えるが、
                    // 実際のステート更新は、各 step の終了時で行われるべき。
                    //
                    // 例えば倍速 Enemy の場合、次のような順で処理が動いてほしい。
                    // - 敵行動
                    // - 混乱解除判定
                    // - 敵行動
                    // - 混乱解除判定
                    // 
                    // これを阻害する可能性として、Scheduler.md にまとめている「Run のマージ」という仕組みがある。
                    // ステート更新を SSchedulerPhase にしてしまうと、
                    // - 敵行動
                    // - 敵行動
                    // - 混乱解除判定
                    // - 混乱解除判定
                    // という順で実行されてしまう。
                    //
                    // そのため onTurnEnd のタイミングでステート更新をかける。
                    //
                    entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);

                //    REGame.scheduler.clearCurrentTurnEntity();
                //}
            }
    
    }

    callSymbol<TSym extends symbol>(target: LEntity, sender: LEntity, subject: SEffectSubject, args: any, symbol: TSym): REResponse {
        const response = target._callBehaviorIterationHelper((behavior: LBehavior) => {
            const func = (behavior as any)[symbol];
            if (func) {
                const args2: CommandArgs = { self: target, sender: sender, subject: subject, args: args };
                const r1 = func.call(behavior, args2, this);
                return r1;
            }
            else {
                return REResponse.Pass;
            }
        });
        return response;
    }

    // TODO: sender っていうのがすごくわかりづらい。
    // target と sender は基本的に self で同一なのでそうして、
    // こうかてきようさきにしたいものを target として引数整理したほうがよさそう。
    post<TSym extends symbol>(target: LEntity, sender: LEntity, subject: SEffectSubject, args: any, symbol: TSym, result?: CommandResultCallback): RECCMessageCommand {
        const m1 = () => {
            const response = this.callSymbol(target, sender, subject, args, symbol);
            if (response != REResponse.Canceled) {
                // コマンドが処理されなかった
                if (result) {
                    result();
                }
            }

            return response;

        };
        this._recodingCommandList.push(new RECCMessageCommand("Post", m1));
        Log.postCommand("Post");
        return this._recodingCommandList[this._recodingCommandList.length - 1];
    }

    postCall(func: () => void): void {
        const m1 = () => {
            Log.doCommand("Call");
            func();
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Call", m1));
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
                RESystem.dialogContext.open(new SActivityPlaybackDialog());
            }
            else {
                RESystem.dialogContext.open(dialogModel);
            }

            return REResponse.Succeeded;
        };

        if (afterChain)
            this._afterChainCommandList.push(new RECCMessageCommand("openDialog", m1));
        else
            this._recodingCommandList.push(new RECCMessageCommand("openDialog", m1));
        Log.postCommand("openDialog");
    }

    postSequel(entity: LEntity, sequelId: number, args?: any): SMotionSequel {
        assert(sequelId > 0);
        const s = new SMotionSequel(entity, sequelId, args);
        const m1 = () => {
            Log.doCommand("Sequel");
            this._sequelContext.addSequel(s);
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Sequel", m1));
        Log.postCommand("Sequel");
        return s;
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
        this._recodingCommandList.push(new RECCMessageCommand("Animation", m1));
        Log.postCommand("Animation");
    }

    postBalloon(entity: LEntity, balloonId: number, wait: boolean) {
        if (balloonId <= 0) return;

        const m1 = () => {
            Log.doCommand("Balloon");
            this._sequelContext.addSequel(new SBalloonSequel(entity, balloonId, wait));
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Balloon", m1));
        Log.postCommand("Balloon");
    }


    

    postWaitSequel() {
        const m1 = () => {
            Log.doCommand("WaitSequel");
            this._sequelContext.flushSequelSet();
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("WaitSequel", m1));
        Log.postCommand("WaitSequel");
    }

    public postWait(entity: LEntity, waitCount: number) {
        const m1 = () => {
            Log.doCommand("Wait");
            this._sequelContext.addSequel(new SWaitSequel(entity, waitCount));
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Wait", m1));
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
        this._recodingCommandList.push(new RECCMessageCommand("ApplyEffect", m1));
        Log.postCommand("ApplyEffect");
    }

    postDestroy(entity: LEntity) {
        const m1 = () => {
            Log.doCommand("Destroy");
            
            // 消滅時に何かアニメーションを再生したいとき、postAnimation() と postDestroy() を連続で実行することがある。
            // その場合 flush しておかないと、先に GC で Entity の消滅と Sprite の消滅が先に行われ、アニメーションが表示されない。
            this._sequelContext.flushSequelSet();
            
            entity.destroy();
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Destroy", m1));
        Log.postCommand("Destroy");
    }

    postMessage(text: string) {
        const m1 = () => {
            Log.doCommand("Message");
            REGame.messageHistory.add(text);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Message", m1));
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
        this._recodingCommandList.push(new RECCMessageCommand("TransferFloor", m1));
        Log.postCommand("TransferFloor");
    }
    
    /*
    public postTransferRMMZMap(entity: LEntity, mapId: number, x: number = 0, y:number = 0, d: number = 0) {
        const m1 = () => {
            Log.doCommand("TransferFloor");
            RESystem.integration.onReserveTransferMap(mapId, x, y, d);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("TransferFloor", m1));
        Log.postCommand("TransferFloor");
    }
    */

    postSkipPart(entity: LEntity): void {
        const behavior = entity.findBehavior(LUnitBehavior);
        assert(behavior);

        const m1 = () => {
            Log.doCommand("SkipPart");
            
            entity.clearActionTokenCount();

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push(new RECCMessageCommand("SkipPart", m1));
        Log.postCommand("SkipPart");
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
        this._recodingCommandList.push(new RECCMessageCommand("ApplyEffect", m1));
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
        this._recodingCommandList.push(new RECCMessageCommand("RemoveFromWhereabouts", m1));
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
            message.call(this);
            //const response = message._func();
    
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
            console.log("  " + x._name);
        });
    }

}


