import { RECommand, REResponse } from "./RECommand";
import { REDialog } from "./REDialog";
import { LEntity } from "../objects/LEntity";
import { SScheduler } from "./SScheduler";
import { assert, Log } from "ts/Common";
import { SAnumationSequel, SMotionSequel, SSequelUnit } from "../objects/REGame_Sequel";
import { REGame } from "../objects/REGame";
import { REEffectContext } from "./REEffectContext";
import { REGame_Block } from "../objects/REGame_Block";
import { RESystem } from "./RESystem";
import { DSkillDataId } from "ts/data/DSkill";
import { CommandArgs, LBehavior } from "ts/objects/behaviors/LBehavior";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { SSequelContext } from "./SSequelContext";

interface RECCMessage {
    name: string;   // for debug
    func: () => REResponse;
}

export type CommandResultCallback = (response: REResponse, reactor: LEntity, context: RECommandContext) => void;

/**
 * 
 * 
 */
export class RECommandContext
{
    private _sequelContext: SSequelContext;
    private _visualAnimationWaiting: boolean = false;   // 不要かも
    private _recodingCommandList: RECCMessage[] = [];
    private _runningCommandList: RECCMessage[] = [];
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
     * postActionTwoWay
     * 
     *  [拾う] など、reactor 側の状態等によって actor 側が目的を達成できない可能性がある Action で使用する。
     * （例えば、床に張り付いた巻物を拾おうとするときは、reactor 側が onPreReaction で Action をはじく）
     */
    postActionTwoWay(actionId: number, actor: LEntity, reactor: LEntity | undefined, args?: any) {
        assert(actionId > 0);

        const actualCommand = new RECommand(actionId, actor, reactor, undefined, args);

        const m1 = () => {
            Log.doCommand("PreAction");
            return actor._sendPreAction(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendPreAction", func: m1 });

        if (reactor) {
            const m2 = () => {
                if (this._lastActorResponce == REResponse.Pass) {  // m1 で未処理なら send
                    Log.doCommand("PreRection");
                    return reactor._sendPreRection(this, actualCommand);
                }
                else
                    return this._lastActorResponce;
            };
            this._recodingCommandList.push({ name: "sendPreRection", func: m2 });
        }

        const m3 = () => {
            if (this._lastActorResponce == REResponse.Pass) {  // m2 で未処理なら send
                Log.doCommand("Action");
                return actor._sendAction(this, actualCommand);
            }
            else
                return this._lastActorResponce;
        };
        this._recodingCommandList.push({ name: "sendAction", func: m3 });

        if (reactor) {
            const m4 = () => {
                // onReaction はひとつ前の実行が Pass ではなくても実行する
                Log.doCommand("Reaction");
                return reactor._sendReaction(this, actor, actualCommand);
            };
            this._recodingCommandList.push({ name: "sendReaction", func: m4 });
        }

        Log.postCommand("postAction");
    }
    
    /**
     * カスタムの RE-Command のように、プラグインとして事前定義できないコマンド実行 Action の呼び出し
     */
    postActionOneWay(actionId: number, actor: LEntity, reactor: LEntity | undefined, effectContext: REEffectContext | undefined, args?: any) {
        assert(actionId > 0);
        
        const actualCommand = new RECommand(actionId, actor, reactor, effectContext, args);

        const m1 = () => {
            Log.doCommand("PreAction");
            return actor._sendPreAction(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendPreAction", func: m1 });

        const m3 = () => {
            if (this._lastActorResponce == REResponse.Pass) {
                Log.doCommand("Action");
                return actor._sendAction(this, actualCommand);
            }
            else {
                return this._lastActorResponce;
            }
        };
        this._recodingCommandList.push({ name: "sendAction", func: m3 });

        Log.postCommand("ActionOneWay");
    }
    
    /**
     * 
     * @param actionId 
     * @param entity onReaction() を呼び出す entity
     * @param actor 
     * @param effectContext 
     * @param args 
     */
    postReaction(actionId: number, entity: LEntity, actor: LEntity, effectContext: REEffectContext | undefined, args?: any) {
        assert(actionId > 0);
        
        const actualCommand = new RECommand(actionId, entity, undefined, effectContext, args);

        const m1 = () => {
            Log.doCommand("PreReaction");
            return entity._sendPreRection(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendPreAction", func: m1 });

        const m3 = () => {
            if (this._lastActorResponce == REResponse.Pass) {
                Log.doCommand("Reaction");
                return entity._sendReaction(this, actor, actualCommand);
            }
            else {
                return this._lastActorResponce;
            }
        };
        this._recodingCommandList.push({ name: "sendReaction", func: m3 });

        Log.postCommand("Reaction");
    }

    // TODO: sender っていうのがすごくわかりづらい。
    // target と sender は基本的に self で同一なのでそうして、
    // こうかてきようさきにしたいものを target として引数整理したほうがよさそう。
    post<TSym extends symbol>(target: LEntity, sender: LEntity, args: any, symbol: TSym, result?: CommandResultCallback): void {
        const m1 = () => {
            const response = target._callBehaviorIterationHelper((behavior: LBehavior) => {
                const func = (behavior as any)[symbol];
                if (func) {
                    const args2: CommandArgs = { self: target, sender: sender, args: args };
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

    findReactorEntityInBlock(block: REGame_Block, actionId: number): LEntity | undefined {
        const layers = block.layers();
        for (let iLayer = layers.length - 1; iLayer >= 0; iLayer--) {   // 上の Layer から
            const reactor = layers[iLayer].entities().find(entity => entity.queryReactions().find(x => x == actionId) != undefined);
            if (reactor) return reactor;
        }
        return undefined;
    }

    openDialog(causeEntity: LEntity, dialogModel: REDialog): void {
        const m1 = () => {
            Log.doCommand("OpenDialog");
            
            RESystem.dialogContext.setCauseEntity(causeEntity);
            RESystem.dialogContext._setDialogModel(dialogModel);
            RESystem.integration.onDialogOpend(RESystem.dialogContext);

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "openDialog", func: m1 });
        Log.postCommand("openDialog");
    }

    postSequel(entity: LEntity, sequelId: number) {
        assert(sequelId > 0);
        const m1 = () => {
            Log.doCommand("Sequel");
            this._sequelContext.addSequel(new SMotionSequel(entity, sequelId));
            this._visualAnimationWaiting = true;
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "Sequel", func: m1 });
        Log.postCommand("Sequel");
    }
    
    // 動きを伴わず、Animation だけ表示するのに使う。 Sequel 作るまでもないものとか。
    postAnimation(entity: LEntity, animationId: number, wait: boolean) {
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
    postTransferFloor(entity: LEntity, floorId: number, x: number = 0, y:number = 0, d: number = 0) {
        const m1 = () => {
            Log.doCommand("TransferFloor");
            REGame.world._transferEntity(entity, floorId, x, y);
            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "TransferFloor", func: m1 });
        Log.postCommand("TransferFloor");
    }
    

    postConsumeActionToken(entity: LEntity): void {
        const attr = entity.findAttribute(LUnitAttribute);
        assert(attr);

        const m1 = () => {
            Log.doCommand("ConsumeActionToken");
            
            attr.setActionTokenCount(attr.actionTokenCount() - 1);  // ここで借金することもあり得る
            entity._actionConsumed = true;

            return REResponse.Succeeded;
        };
        this._recodingCommandList.push({ name: "ConsumeActionToken", func: m1 });
        Log.postCommand("ConsumeActionToken");
    }

    postSkipPart(entity: LEntity): void {
        const attr = entity.findAttribute(LUnitAttribute);
        assert(attr);

        const m1 = () => {
            Log.doCommand("SkipPart");
            
            attr.clearActionTokenCount();
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
        return this._messageIndex < this._runningCommandList.length;
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
        if (this.isRunning()) {
            const message = this._runningCommandList[this._messageIndex];
            const response = message.func();
    
            if (RESystem.dialogContext._hasDialogModel()) {
                // もし command の実行で Dialog が表示されたときは index を進めない。
                // Dialog が閉じたときに進める。
            }
            else {
                this._next();
            }
        }
    }

    _next() {
        assert(this._commandChainRunning);
        this._messageIndex++;

        if (this._messageIndex >= this._runningCommandList.length) {
            this._commandChainRunning = false;
            Log.d("<<<<[End CommandChain]");

            // CommandChain 中に post されたものがあれば、続けて swap して実行開始してみる
            if (this._recodingCommandList.length > 0) {
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
    }

    dumpCommands() {
        console.log("Commands:");
        this._runningCommandList.forEach(x => {
            console.log("  " + x.name);
        });
    }

}


