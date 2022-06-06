import { checkContinuousResponse, SCommandResponse } from "./RECommand";
import { SDialog } from "./SDialog";
import { LEntity } from "../objects/LEntity";
import { assert, Log } from "ts/re/Common";
import { SAnumationSequel, SBalloonSequel, SMotionSequel, SWaitSequel } from "./SSequel";
import { REGame } from "../objects/REGame";
import { SEffectContext, SEffectSubject } from "./SEffectContext";
import { LBlock } from "../objects/LBlock";
import { RESystem } from "./RESystem";
import { CommandArgs, DecisionPhase, LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { SSequelContext } from "./SSequelContext";
import { SActivityPlaybackDialog } from "ts/re/system/dialogs/SActivityPlaybackDialog";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { LRandom } from "ts/re/objects/LRandom";
import { LActionTokenType } from "../objects/LActionToken";
import { SActivityContext } from "./SActivityContext";
import { DActionId } from "../data/DAction";


export enum STaskResult {
    Succeeded,
    Rejected,
}

export enum STaskCallMethod {
    Default,
    Then,
    Catch,
}

// export class STaskChain {
//     resolve: () => void;
//     reject: () => void;
//     _command: RECCMessageCommand;
// }

export type MCEntryProc = () => SCommandResponse;
export type TaskThenFunc = (c: SSubTaskChain) => void;
export type TaskCatchFunc = (c: SSubTaskChain) => void;
export type TaskFinallyFunc = (c: SSubTaskChain) => void;
export type CommandResultCallback = () => boolean;

export class RECCMessageCommand {

    _name: string;   // for debug
    _entryFunc: MCEntryProc | undefined;
    _chainFunc: CommandResultCallback | undefined;//TaskThenFunc | undefined;
    _nextTask: RECCMessageCommand | undefined;
    
    _result: STaskResult;   // これは Behavior リストの成否ではなく Command の成否なので、Response 関係なし。普通の Promise と同様、二値。
    //_prev: RECCMessageCommand | undefined;

    _subChain: SSubTaskChain | undefined;
    _thenFunc2: TaskThenFunc | undefined;
    _catchFunc: TaskCatchFunc | undefined;
    _finallyFunc: TaskFinallyFunc | undefined;
    _callMethod: STaskCallMethod = STaskCallMethod.Default;

    constructor(name: string, entryFunc: MCEntryProc | undefined, chainFunc?: CommandResultCallback | undefined, prev?: RECCMessageCommand | undefined) {
        assert(!(entryFunc && chainFunc));
        this._name = name;
        this._entryFunc = entryFunc;
        this._chainFunc = chainFunc;
        this._result = STaskResult.Succeeded;
        //this._prev = prev;
    }

    public then(func: CommandResultCallback): RECCMessageCommand {
        assert(!this._nextTask);
        this._nextTask = new RECCMessageCommand("then", undefined, func);
        return this._nextTask;
    }

    public then2(func: TaskThenFunc): RECCMessageCommand {
        assert(this._subChain);
        assert(!this._nextTask);
        this._nextTask = new RECCMessageCommand("then", undefined, undefined);
        this._nextTask._subChain = this._subChain;
        this._nextTask._thenFunc2 = func;
        return this._nextTask;
    }

    public catch(func: TaskCatchFunc): this {
        assert(!this._catchFunc);
        this._catchFunc = func;
        return this;
    }

    public finally(func: TaskFinallyFunc): RECCMessageCommand {
        assert(this._subChain);
        assert(!this._nextTask);
        this._nextTask = new RECCMessageCommand("finally", undefined, undefined);
        this._nextTask._subChain = this._subChain;
        this._nextTask._finallyFunc = func;
        return this._nextTask;
    }

    public call(cctx: SCommandContext): STaskResult {
        if (this._callMethod == STaskCallMethod.Default) {
            if (this._result == STaskResult.Rejected) {
                // if (this._catchFunc) {
                //     this._catchFunc();
                // }
                throw new Error();
                return STaskResult.Rejected;
            }
            else {
                // const c: STaskChain = {
                //     resolve: () => {
                //         this._result = STaskResult.Succeeded;
                //         this.setNextPriorityTaskIfNeeded(cctx);
                //     },
                //     reject: () => {
                //         this._result = STaskResult.Rejected;
                //     },
                //     _command: this,
                // };
    
                if (this._entryFunc) {
                    this._result = (this._entryFunc() != SCommandResponse.Canceled) ? STaskResult.Succeeded : STaskResult.Rejected;
                }
                else if (this._chainFunc) {
                    this._result = (this._chainFunc()) ? STaskResult.Succeeded : STaskResult.Rejected;
                }
                return this._result;
            }
        }
        else {
            assert(this._subChain);
            if (this._callMethod == STaskCallMethod.Then) {
                if (this._finallyFunc) {
                    this._finallyFunc(this._subChain);
                }
                else {
                    assert(this._thenFunc2);
                    this._thenFunc2(this._subChain);
                }
            }
            else {
                assert(this._catchFunc);
                this._catchFunc(this._subChain);
            }
            return STaskResult.Succeeded;
        }
    }

    private setNextPriorityTaskIfNeeded(ctx: SCommandContext) {
        if (this._nextTask) {
            ctx._setNextPriorityTask(this._nextTask);
        }
    }
}

export enum SHandleCommandResult {
    Resolved,
    Rejected,
}

export class HandleActivityCommand {
    _thenFunc: (() => SHandleCommandResult) | undefined;
    _catchFunc: (() => void) | undefined;

    public then(func: () => SHandleCommandResult): this {
        this._thenFunc = func;
        return this;
    }

    public catch(func: () => void): this {
        this._catchFunc = func;
        return this;
    }
}

export class SSubTaskChain {
    private _ctx: SCommandContext;
    private _firstTask: RECCMessageCommand;
    private _currentTask: RECCMessageCommand | undefined;
    private _error: boolean;
    private _errorHandled: boolean;

    public constructor(ctx: SCommandContext, first: RECCMessageCommand) {
        this._ctx = ctx;
        this._firstTask = first;
        this._currentTask = first;
        this._error = false;
        this._errorHandled = false;
    }

    public resolve(): void {
        assert(this._currentTask);
        const next = this._currentTask._nextTask;
        if (next && next._thenFunc2) {
            next._callMethod = STaskCallMethod.Then;
            this._ctx._setNextPriorityTask(next);
            this._currentTask = next;
        }
    }
    
    public reject(): void {
        assert(this._currentTask);
        assert(!this._errorHandled);
        this._error = true;

        // Task につながっている直近の catch を探してみる
        let t: RECCMessageCommand | undefined = this._currentTask._nextTask;
        while (t) {
            if (t._finallyFunc) {
                t._callMethod = STaskCallMethod.Then;
                this._ctx._setNextPriorityTask(t);
                this._currentTask = t;
                break;
            }
            if (t._catchFunc) {
                t._callMethod = STaskCallMethod.Catch;
                this._ctx._setNextPriorityTask(t);
                this._currentTask = t;
                this._errorHandled = true;
                break;
            }
            t = t._nextTask;
        }
    }

    public next(): void {
        assert(this._currentTask);
        assert(this._currentTask._catchFunc || this._currentTask._finallyFunc); // catch または finally から実行できる

        if (this._error) {
            // 次の finally へ
            let t: RECCMessageCommand | undefined = this._currentTask._nextTask;
            while (t) {
                if (t._finallyFunc) {
                    t._callMethod = STaskCallMethod.Then;
                    this._ctx._setNextPriorityTask(t);
                    this._currentTask = t;
                    break;
                }
                if (!this._errorHandled) {
                    if (t._catchFunc) {
                        t._callMethod = STaskCallMethod.Catch;
                        this._ctx._setNextPriorityTask(t);
                        this._currentTask = t;
                        this._errorHandled = true;
                        break;
                    }
                }
                t = t._nextTask;
            }
        }
        else {
            this.resolve();
        }
    }
}

/**
 * 
 * 基本的な使い方
 * ----------
 * 
 * 次のようにすることで、 Task を積むことができる。
 * ```
 * ctx.post(...);
 * ctx.post(...);
 * ctx.post(...);
 * ```
 * 
 * post の実行順序
 * ----------
 * 
 * ```
 * ctx.post(_ => {      // A
 *   ctx.post(...);     // B
 * });
 * ctx.post(_ => {      // C
 *   ctx.post(...);     // D
 * });
 * ctx.post(...);       // E
 * ```
 * 
 * この場合、まず [A, C, E] のような TaskList ができる。
 * これを実行した結果、次に [B, D] のような TaskList ができる。
 * 結果的に Task の実行順は A > C > E > B > D となる。
 * 
 * このケースの場合、事前の Task の結果によって実行の可否を制御することはできない。
 * つまり一度 TaskList に積まれた Task は、必ず実行される。
 * 
 * 条件を付けたい場合は次の then, catch を使用する。
 * 
 * then, catch
 * ----------
 * 
 * then, catch を使うことで、post した Task の成否に応じて実行する処理をチェーンできる。
 * ```
 * ctx.post(...)
 *   .then()        // 1つ目の post の処理が成功したら実行される
 *   .catch();      // 1つ目の post の処理が失敗したら実行される
 * ctx.post(...);   // 上記成否にかかわらず実行される。
 * ctx.post(...);
 * ```
 * then, catch の処理は、起点となる Task と同一の TaskList 上で実行される。
 * 例えば上記の場合、2つ目の post の前に実行される。
 * 
 * then は新たな Task を生成して返すが、catch は this を返す。
 * メソッドチェーンを書きたい場合は、catch を先に書くのが無難。
 * 
 * ```
 * ctx.post(A)
 *   .catch(A失敗)
 *   .then(B)
 *   .catch(B失敗)
 *   .then(C)
 * ```
 * 
 * finally
 * ----------
 * 
 * 成否にかかわらず、SubTaskChain の最後に必ず実行したい処理を finally で追加できる。
 * ```
 * ctx.post(onAnyAction)
 *     .then(...)
 *     .catch(...)
 *     .finally(_ => {
 *         
 *     });
 * ```
 * 
 * エラー時に実行される then と catch
 * ----------
 * 
 * エラーした場合、
 * - 以降の then は呼ばれない。
 * - 以降の、直近の catch 1つが呼ばれる。
 * 
 * ```
 * ctx.post(A)
 *   .catch(A失敗)
 *   .then(B)      // ここで失敗したら、
 *   .then(C)
 *   .catch(B失敗)  // この catch だけが実行される。
 *   .then(D)       // これは呼ばれない。
 *   .catch(失敗)   // これは呼ばれない。
 * 
 * resolve と reject
 * ----------
 * 
 * Promise 同様、実行関数は次の形が基本となる。
 * 
 * ```
 * (c) => {
 *   if (成功) {
 *     c.resolve();
 *   }
 *   else {
 *     c.reject();
 *   }
 * }
 * ```
 * 
 * デフォルトは resolve とする。 Behavior 側にコマンドハンドラが1つも無い場合はエラーにせず先に進みたい。
 * resolve() したら、その時点でチェインされている Task を Priority に設定する。
 * つまり、
 * ```
 * ctx.post(...)    // A
 * c.resolve();      // B(呼び出し元の then)
 * ctx.post(...)    // C
 * ```
 * このような場合、実行順は B > A > C となる。
 * 
 * 順序通りにしたい場合、次のような postResolve を作るのもありかもしれない。（使うかわからないので未対応）
 * ```
 * ctx.post(...)    // A
 * ctx.postResolve(c);  // B(呼び出し元の then)
 * ctx.post(...)    // C
 * ```
 * 
 * Behavior 側のコマンドハンドラ側の制限事項・注意点
 * ----------
 * 
 * 誤用防止のため、resolve, reject は1度しか呼び出すことはできない。
 * コマンドハンドラは次のように Handled を返し、後続のコマンドハンドラの呼び出しを抑制しなければならない。
 * ```
 * onAnyAction(c) {
 *     if (...) {
 *         c.resolve();
 *         return Handled;
 *     }
 *     else else {
 *         c.reject();
 *         return Handled;
 *     }
 *     else {
 *         return Pass;
 *     }
 * }
 * ```
 * 
 * コマンドハンドラ側で Dialog 表示を伴う際の基本的な書き方は次のようになる。
 * ```
 * onAnyAction(c) {
 *     ctx.postDialog(..., _ => {
 *         if (...) {
 *             c.resolve();
 *         }
 *         else {
 *             c.reject();
 *         }
 *     });
 *     return Handled;
 * }
 * ```
 * resolve() や reject() は遅延実行の形になるが実行はされるので、 Handled を返すべきである。
 * 
 * 
 * 
 */
export class SCommandContext
{
    private _sequelContext: SSequelContext;
    private _visualAnimationWaiting: boolean = false;   // 不要かも
    _recodingCommandList: RECCMessageCommand[] = [];
    private _nextPriorityTask: RECCMessageCommand | undefined;
    private _runningCommandList: RECCMessageCommand[] = [];
    private _afterChainCommandList: RECCMessageCommand[] = [];
    private _messageIndex: number = 0;
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
        this._commandChainRunning = false;
    }

    public random(): LRandom {
        return REGame.world.random();
    }

    public checkOpenDialogRequired(): boolean {
        return this._recodingCommandList.find(x => x._name == "openDialog") !== undefined;
    }

    public postTask(func: TaskThenFunc): RECCMessageCommand {
        const task = new RECCMessageCommand("Task", undefined);
        task._callMethod = STaskCallMethod.Then;
        task._thenFunc2 = func;
        task._subChain = new SSubTaskChain(this, task);
        this._recodingCommandList.push(task);
        return task;
    }

    postConsumeActionToken(entity: LEntity, tokenType: LActionTokenType): void {
        const behavior = entity.findEntityBehavior(LUnitBehavior);
        assert(behavior);
        entity._actionToken.verify(tokenType);

        const m1 = () => {
            Log.doCommand("ConsumeActionToken");

            this.attemptConsumeActionToken(entity, tokenType);
            

            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("ConsumeActionToken", m1));
        Log.postCommand("ConsumeActionToken");
    }


    /*
    [2022/5/28] postActivity vs postCall(メソッド直接コール) vs post(シンボル)
    ----------
    ### postActivity
    - 例えば Move は 3-Way する必要はない。
        - でも、逆に言えば今のところ、Move 以外は 3-Way する余地はある。
    - 引数は any を使う必要がある。
    
    ### postCall(メソッド直接コール)
    - 引数を柔軟に決められる。TurnEnd など、フレームワークで決められたタイミングを通知するために使うべき。

    ### post(シンボル)
    - 引数は any を使う必要がある。
    - 現時点までで作ったシンボルを見ると、上記２つに統合してもよさそう。
    - Activity から別の Activity を投げるのは OK（ゲイズのあやつりなど）なので、シンボル使う意味も薄くなってきてる。
    - 必要そうなのは test 系。つまり、複数の Activity から使いたい共通のハンドシェイク。
        - test 系の統合は難しい。例えば今は testPickOutItem でアイテムをその場から取り出せるかをチェックするが、
          統合するなら Reaction 側で取り出す系の Activity 全てに反応しなければならない。
          当然ながら、拡張性が乏しくなる。
            - 今の 聖域の巻物の onActivityPreReaction も危険。
        - onWalkedOnTopAction も共通処理か。Move や Fall など、地面上を移動したときの共通処理。

    ### SActivityContext にシンボルも混ぜてあげる案
    

    */
    public postActivity(srcActivity: LActivity, withPreprocess: boolean = true): SActivityContext {

        let activity = srcActivity;
        if (withPreprocess) {
            for (const b of srcActivity.actor().collectBehaviors().reverse()) {
                activity = b.onPreprocessActivity(this, activity);
            }
        }

        if (activity.isConsumeAction()) {
            activity.actor()._actionToken.verify(activity.getConsumeActionTokenType());
        }

        const actx = new SActivityContext(srcActivity);

        const m1 = () => {
            Log.doCommand("Activity");

            if (activity.isConsumeAction()) {
                const entity = activity.actor();
                this.attemptConsumeActionToken(entity, activity.getConsumeActionTokenType());
            }

            const r = activity.actor()._sendActivity(this, actx);
            // if (r != SCommandResponse.Canceled) { // TODO: ここ Succeeded のほうがいいかも
            //     if (activity.hasObject()) {
            //         this.postCall(() => {
            //             activity.object()._sendActivityReaction(this, activity);
            //         });
            //     }
            // }
            if (r == SCommandResponse.Pass) {
                if (actx._catchFunc) actx._catchFunc();
            }
            return r;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Activity", m1));

        Log.postCommand("Activity");
        return actx;
    }


    private attemptConsumeActionToken(entity: LEntity, tokenType: LActionTokenType): void {
        entity._actionToken.consume(tokenType);
        entity._schedulingResult.setConsumedActionTokeInCurrentPhase(tokenType);
        
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
                    entity._effectResult.clear();   // TODO: 仮
                    entity.params().updateBuffs(entity);
                    //entity._effectResult.showResultMessages(RESystem.commandContext, entity);   // TODO: 仮
                    RESystem.integration.flushEffectResultOneEntity(entity);

                    //entity._callDecisionPhase(RESystem.commandContext, DecisionPhase.UpdateState);

                //    REGame.scheduler.clearCurrentTurnEntity();
                //}
            }
    
    }

    callSymbol<TSym extends symbol>(target: LEntity, sender: LEntity, subject: SEffectSubject, args: any, symbol: TSym): SCommandResponse {
        const response = target._callBehaviorIterationHelper((behavior: LBehavior) => {
            const func = (behavior as any)[symbol];
            if (func) {
                const args2: CommandArgs = { self: target, sender: sender, subject: subject, args: args };
                const r1 = func.call(behavior, args2, this);
                return r1;
            }
            else {
                return SCommandResponse.Pass;
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
            if (response != SCommandResponse.Canceled) {
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

    postCall(func: () => void): RECCMessageCommand {
        const m1 = () => {
            Log.doCommand("Call");
            func();
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Call", m1));
        Log.postCommand("Call");
        return this._recodingCommandList[this._recodingCommandList.length - 1];
    }

    findReactorEntityInBlock(block: LBlock, actionId: number): LEntity | undefined {
        const layers = block.layers();
        for (let iLayer = layers.length - 1; iLayer >= 0; iLayer--) {   // 上の Layer から
            const reactor = layers[iLayer].entities().find(entity => entity.queryReactions().find(x => x == actionId) != undefined);
            if (reactor) return reactor;
        }
        return undefined;
    }

    openDialog(causeEntity: LEntity, dialogModel: SDialog, afterChain: boolean): SDialog {
        const m1 = () => {
            Log.doCommand("OpenDialog");
            
            RESystem.dialogContext.setCauseEntity(causeEntity);

            if (REGame.recorder.isPlayback()) {
                RESystem.dialogContext.open(new SActivityPlaybackDialog());
            }
            else {
                RESystem.dialogContext.open(dialogModel);
            }

            return SCommandResponse.Handled;
        };

        if (afterChain)
            this._afterChainCommandList.push(new RECCMessageCommand("openDialog", m1));
        else
            this._recodingCommandList.push(new RECCMessageCommand("openDialog", m1));
        Log.postCommand("openDialog");
        return dialogModel;
    }

    postSequel(entity: LEntity, sequelId: number, targetX?: number, targetY?: number, args?: any): SMotionSequel {
        assert(sequelId > 0);
        const tx = targetX ?? entity.mx;
        const ty = targetY ?? entity.my;
        const s = new SMotionSequel(entity, sequelId, tx, ty, args);
        const m1 = () => {
            Log.doCommand("Sequel");
            this._sequelContext.addSequel(s);
            this._visualAnimationWaiting = true;
            return SCommandResponse.Handled;
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
            return SCommandResponse.Handled;
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
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Balloon", m1));
        Log.postCommand("Balloon");
    }


    

    postWaitSequel() {
        const m1 = () => {
            Log.doCommand("WaitSequel");
            this._sequelContext.flushSequelSet(true);
            this._visualAnimationWaiting = true;
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("WaitSequel", m1));
        Log.postCommand("WaitSequel");
    }

    public postWait(entity: LEntity, waitCount: number) {
        const m1 = () => {
            Log.doCommand("Wait");
            this._sequelContext.addSequel(new SWaitSequel(entity, waitCount));
            this._visualAnimationWaiting = true;
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Wait", m1));
        Log.postCommand("Wait");
    }

    public postEmitEffect(entity: LEntity, actionId: DActionId, subject: LEntity, target: LEntity, dir: number): void {
        const m1 = () => {
            entity.iterateBehaviorsReverse(b => {
                const r = b.onEmitEffect(entity, this, actionId, subject, target, dir);
                return r == SCommandResponse.Pass;
            });
            return SCommandResponse.Pass;
        };
        this._recodingCommandList.push(new RECCMessageCommand("ApplyEffect", m1));
        Log.postCommand("ApplyEffect");
    }

    postDestroy(entity: LEntity) {
        const m1 = () => {
            Log.doCommand("Destroy");
            
            // 消滅時に何かアニメーションを再生したいとき、postAnimation() と postDestroy() を連続で実行することがある。
            // その場合 flush しておかないと、先に GC で Entity の消滅と Sprite の消滅が先に行われ、アニメーションが表示されない。
            //this._sequelContext.flushSequelSet();
            
            entity.destroy();
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Destroy", m1));
        Log.postCommand("Destroy");
    }

    postMessage(text: string) {
        assert(text);   // 空メッセージが来るときは何かおかしいことが多いのでガードしておく
        
        const m1 = () => {
            Log.doCommand("Message");
            REGame.messageHistory.add(text);
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("Message", m1));
        Log.postCommand("Message");
    }

    public postEffectResult(entity?: LEntity | undefined): void {
        const m1 = () => {
            if (entity)
                RESystem.integration.flushEffectResultOneEntity(entity);
            else
                RESystem.integration.flushEffectResult();
            return SCommandResponse.Handled;
        };
        this._recodingCommandList.push(new RECCMessageCommand("EffectResult", m1));
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
            REGame.world.transferEntity(entity, floorId, x, y);
            return SCommandResponse.Handled;
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
        const behavior = entity.findEntityBehavior(LUnitBehavior);
        assert(behavior);

        const m1 = () => {
            Log.doCommand("SkipPart");
            
            entity._actionToken.clearActionTokenCount();

            return SCommandResponse.Handled;
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
        return this._nextPriorityTask != undefined ||
            this._messageIndex < this._runningCommandList.length ||
            this._recodingCommandList.length != 0 ||
            this._afterChainCommandList.length != 0;
    }

    isRecordingListEmpty(): boolean {
        return this._recodingCommandList.length == 0;
    }

    isEmpty(): boolean {
        return !this.isRunning() && this.isRecordingListEmpty();
    }

    _processCommand() {
        if (this._nextPriorityTask) {
            // 優先タスクがあるので、swap は今回は待つ
        }
        else {
            if (this._messageIndex >= this._runningCommandList.length) {
                if (this._recodingCommandList.length > 0 || this._afterChainCommandList.length > 0) {
                    this._submit();
                }
            }
        }


        if (this.isRunning()) {
            // 今回実行したい Task は？
            const task = this._nextPriorityTask ? this._nextPriorityTask : this._runningCommandList[this._messageIndex];
            this._nextPriorityTask = undefined;

            // 次の call で catch を呼ぼうとしている？
            // const callingCatch = !task._result;

            // Task 実行
            const result = task.call(this);
            if (result != STaskResult.Rejected) {
                // つながっている Task があれば、次にそれを実行してみる
                if (task._nextTask && !task._subChain) {
                    this._nextPriorityTask = task._nextTask;
                }
            }
            // else if (!callingCatch) {   // SubTasckChain の中で catch はひとつしか呼びたくない
            //     // Task につながっている直近の catch を探してみる
            //     let t = task._nextTask;
            //     while (t) {
            //         if (t._catchFunc) {
            //             this._nextPriorityTask = t;
            //         }
            //         t = t._nextTask;
            //     }
            //     if (this._nextPriorityTask) {
            //         // 次の call で reject 側が実行されるようにする。
            //         // 変数を使いまわしているのであんまりよくないかもしれない。
            //         this._nextPriorityTask._result = STaskResult.Rejected;
            //     }
            // }

            // ここまでで、最後に実行した Task の nextTask が無ければ、TaskList にある次の Task へ進む
            if (!this._nextPriorityTask) {
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

    _setNextPriorityTask(task: RECCMessageCommand): void {
        assert(!this._nextPriorityTask);
        this._nextPriorityTask = task;
    }

    dumpCommands() {
        console.log("Commands:");
        this._runningCommandList.forEach(x => {
            console.log("  " + x._name);
        });
    }

}


