import { RECommand, REResponse } from "./RECommand";
import { REDialog } from "./REDialog";
import { REGame_Entity } from "../objects/REGame_Entity";
import { REScheduler } from "./REScheduler";
import { assert, Log } from "ts/Common";
import { REGame_Sequel } from "../objects/REGame_Sequel";
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

export type CommandResultCallback = (response: REResponse, reactor: REGame_Entity, context: RECommandContext) => void;

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
    postActionTwoWay(actionId: number, actor: REGame_Entity, reactor: REGame_Entity | undefined, args?: any) {
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
                return reactor._sendReaction(this, actualCommand);
            };
            this._recodingCommandList.push({ name: "sendReaction", func: m4 });
        }

        Log.postCommand("postAction");
    }
    
    /**
     * postActionOneWay
     * 
     * [攻撃] など、reactor 側の状態に関係なく actor 側が実行できる Action で使用する。
     */
    postActionOneWay(actionId: number, actor: REGame_Entity, effectContext: REEffectContext | undefined, args?: any) {
        assert(actionId > 0);
        
        const actualCommand = new RECommand(actionId, actor, undefined, effectContext, args);

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
     */
    postReaction(actionId: number, reactor: REGame_Entity, effectContext: REEffectContext | undefined, args?: any) {
        assert(actionId > 0);
        
        const actualCommand = new RECommand(actionId, reactor, undefined, effectContext, args);

        const m1 = () => {
            Log.doCommand("PreReaction");
            return reactor._sendPreRection(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendPreAction", func: m1 });

        const m3 = () => {
            if (this._lastActorResponce == REResponse.Pass) {
                Log.doCommand("Reaction");
                return reactor._sendReaction(this, actualCommand);
            }
            else {
                return this._lastActorResponce;
            }
        };
        this._recodingCommandList.push({ name: "sendReaction", func: m3 });

        Log.postCommand("Reaction");
    }

    post<TSym extends symbol>(target: REGame_Entity, sender: REGame_Entity, args: any, symbol: TSym, result?: CommandResultCallback): void {
        const m1 = () => {
            const response = target._callBehaviorIterationHelper((behavior: LBehavior) => {
                const func = (behavior as any)[symbol];
                if (func) {
                    const args2: CommandArgs = { self: target, sender: sender, args: args };
                    const r1 = func.call(behavior, args2, this);
                    if (r1 != REResponse.Pass) {
                        // 何らかの形でコマンドが処理された
                        if (result) {
                            result(r1, target, this);
                        }
                    }
                    return r1;
                }
                else {
                    return REResponse.Pass;
                }
            });

            if (response == REResponse.Pass) {
                // コマンドが処理されなかった
                if (result) {
                    result(response, target, this);
                }
            }

            return REResponse.Consumed;

        };
        this._recodingCommandList.push({ name: "Post", func: m1 });
        Log.postCommand("Post");
    }



    /*
    postActionToBlock(actionId: number, actor: REGame_Entity, block: REGame_Block, args?: any) {
        // 送信対象検索
        let reactor = thi;
        if (!reactor) {
            return;
        }

        this.postAction(actionId, actor, reactor, args);
    }
    */

    findReactorEntityInBlock(block: REGame_Block, actionId: number): REGame_Entity | undefined {
        const layers = block.layers();
        for (let iLayer = layers.length - 1; iLayer >= 0; iLayer--) {   // 上の Layer から
            const reactor = layers[iLayer].entities().find(entity => entity.queryReactions().find(x => x == actionId) != undefined);
            if (reactor) return reactor;
        }
        return undefined;
    }

    openDialog(causeEntity: REGame_Entity, dialogModel: REDialog): void {
        const m1 = () => {
            Log.doCommand("OpenDialog");
            
            RESystem.dialogContext.setCauseEntity(causeEntity);
            RESystem.dialogContext._setDialogModel(dialogModel);
            REGame.integration.onDialogOpend(RESystem.dialogContext);

            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "openDialog", func: m1 });
        Log.postCommand("openDialog");
    }

    postSequel(entity: REGame_Entity, sequelId: number) {
        assert(sequelId > 0);
        const m1 = () => {
            Log.doCommand("Sequel");
            this._sequelContext.addSequel(new REGame_Sequel(entity, sequelId));
            this._visualAnimationWaiting = true;
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "Sequel", func: m1 });
        Log.postCommand("Sequel");
    }

    postDestroy(entity: REGame_Entity) {
        const m1 = () => {
            Log.doCommand("Destroy");
            entity.destroy();
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "Destroy", func: m1 });
        Log.postCommand("Destroy");
    }

    postMessage(text: string) {
        const m1 = () => {
            Log.doCommand("Message");
            REGame.messageHistory.add(text);
            return REResponse.Consumed;
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
    postTransferFloor(entity: REGame_Entity, floorId: number, x: number = 0, y:number = 0, d: number = 0) {
        const m1 = () => {
            Log.doCommand("TransferFloor");
            REGame.world._transferEntity(entity, floorId, x, y);
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "TransferFloor", func: m1 });
        Log.postCommand("TransferFloor");
    }
    

    postConsumeActionToken(entity: REGame_Entity): void {
        const attr = entity.findAttribute(LUnitAttribute);
        assert(attr);

        const m1 = () => {
            Log.doCommand("ConsumeActionToken");
            
            attr.setActionTokenCount(attr.actionTokenCount() - 1);  // ここで借金することもあり得る
            entity._actionConsumed = true;

            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "ConsumeActionToken", func: m1 });
        Log.postCommand("ConsumeActionToken");
    }

    postPerformSkill(performer: REGame_Entity, skillId: DSkillDataId): void {
        const m1 = () => {
            Log.doCommand("PerformSkill");
            RESystem.skillBehaviors[skillId].onPerforme(skillId, performer, this);
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "PerformSkill", func: m1 });
        Log.postCommand("PerformSkill");
    }

    // Skill や Item などの効果適用。
    // MP cost など発動可能判定は呼び出す前に済ませること。
    postApplyEffect(context: REEffectContext): void {
        const m1 = () => {
            Log.doCommand("ApplyEffect");
            // TODO:
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "ApplyEffect", func: m1 });
        Log.postCommand("ApplyEffect");
    }

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
                // Dialog が閉じたときに進めるが、例えば矢弾を装備したとき等はターンの消費しないので進めない。
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


