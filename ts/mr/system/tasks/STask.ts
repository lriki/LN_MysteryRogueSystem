import { assert, tr2 } from "ts/mr/Common";
import { SCommand, SCommandResponse } from "../SCommand";
import { SCommandContext } from "../SCommandContext";

export enum STaskYieldResult {
    Running,
    Reject,
    Success,
    Accept,
}

export type MCEntryProc = () => SCommandResponse;
export type TaskThenFunc = (c: SSubTaskChain) => STask | void;     // task を返した場合、その task が succeeded で終了したら、次の Task を開始する。void の場合、明示的に reject() しないかぎり next() を呼んだとの同じ扱いになる。
export type TaskCatchFunc = (c: SSubTaskChain) => void;
export type TaskFinallyFunc = (c: SSubTaskChain) => void;
export type CommandResultCallback = () => boolean;

export type TaskYieldFunc = (c: SSubTaskChain) => Generator<STaskYieldResult>;

export enum STaskStatus {
    Created,    // 初期状態
    Pending,    // 実行待ち。CommandList, thenなどのchain 追加済み。
    Running,    // 実行中。成否は未確定。
    Succeeded,  // 実行終了。成功。
    Handled,    // 実行終了。次のタスクに進まない。
}

export class STask {

    _status: STaskStatus;
    _name: string;   // for debug
    _entryFunc: MCEntryProc | undefined;
    _chainFunc: CommandResultCallback | undefined;
    _nextTask: STask | undefined;
    
    //_result: STaskResult;   // これは Behavior リストの成否ではなく Command の成否なので、Response 関係なし。普通の Promise と同様、二値。
    //_prev: RECCMessageCommand | undefined;

    _subChain: SSubTaskChain | undefined;
    _thenFunc2: TaskThenFunc | undefined;
    _catchFunc: TaskCatchFunc | undefined;
    _finallyFunc: TaskFinallyFunc | undefined;
    _callMethod: STaskCallMethod = STaskCallMethod.Default;


    _iterator: Generator<STaskYieldResult> | undefined;
    _onIteratorFinalized: ((result: STaskYieldResult) => void) | undefined;


    _whenWaitingTasks: STask[] = [];    // whenAny, whenAll で指定された Task. これらの Task が全て完了したら、この Task を実行する。
    _blockingTask: STask | undefined    // then() に指定された処理の戻り値 Task.

    public command: SCommand | undefined;

    constructor(name: string, entryFunc: MCEntryProc | undefined, chainFunc?: CommandResultCallback | undefined, prev?: STask | undefined) {
        assert(!(entryFunc && chainFunc));
        this._status = STaskStatus.Created;
        this._name = name;
        this._entryFunc = entryFunc;
        this._chainFunc = chainFunc;
        //this._result = STaskResult.Succeeded;
        //this._prev = prev;
    }
    
    public get isCompleted(): boolean { return this._status > STaskStatus.Running; }

    public then(func: CommandResultCallback): STask {
        assert(!this._nextTask);
        const task = this.thenTask(new STask("then", undefined, func));
        return task;
    }

    public then2(func: TaskThenFunc): STask {
        assert(this._subChain);
        const task = this.thenTask(new STask("then", undefined, undefined));
        task._subChain = this._subChain;
        task._thenFunc2 = func;
        return task;
    }

    public thenTask(task: STask): STask {
        assert(!this._nextTask);
        assert(task._status == STaskStatus.Created);
        task._status = STaskStatus.Pending;
        this._nextTask = task;
        return this._nextTask;
    }

    // SCommand で thenTask() するユーティリティ
    public thenCommandTask(cmd: SCommand): STask {
        assert(this._subChain);
        const cctx = this._subChain._ctx;
        return this.thenTask(cctx.makeCommandTask(cmd));
    }

    public catch(func: TaskCatchFunc): this {
        assert(!this._catchFunc);
        this._catchFunc = func;
        return this;
    }

    public finally(func: TaskFinallyFunc): STask {
        assert(this._subChain);
        assert(!this._nextTask);
        const task = this.thenTask(new STask("finally", undefined, undefined));
        task._subChain = this._subChain;
        task._finallyFunc = func;
        return task;
    }

    public call(cctx: SCommandContext): boolean {
        assert(this._status == STaskStatus.Pending);
        this._status = STaskStatus.Running;

        if (this._callMethod == STaskCallMethod.Default) {
            // deprecated


            // if (this._result == STaskResult.Rejected) {
            //     // if (this._catchFunc) {
            //     //     this._catchFunc();
            //     // }
            //     throw new Error();
            // }
            // else {
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
                    this._status = (this._entryFunc() != SCommandResponse.Canceled) ? STaskStatus.Succeeded : STaskStatus.Handled;
                }
                else if (this._chainFunc) {
                    this._status = (this._chainFunc()) ? STaskStatus.Succeeded : STaskStatus.Handled;
                }

                if (this._status != STaskStatus.Handled) {
                    // つながっている Task があれば、次にそれを実行してみる
                    if (this._nextTask && !this._subChain) {
                        cctx._setNextPriorityTask(this._nextTask);
                    }
                }
            // }
        }
        else {
            assert(this._subChain);
            cctx.pushSubTaskChain(this._subChain);

            if (this._callMethod == STaskCallMethod.When) {
                const status = this.checkWaitingTasksStatus();
                if (status == STaskStatus.Succeeded) {
                    // ここでは next() せず、prologueCalling() の処理と共に next() する
                }
                else {
                    this._subChain.reject();
                }
                this.prologueCalling(undefined);
            }
            else if (this._callMethod == STaskCallMethod.Then) {
                if (this._finallyFunc) {
                    this._finallyFunc(this._subChain);
                    this.prologueCalling(undefined);
                }
                else {
                    assert(this._thenFunc2);
                    const blockTask = this._thenFunc2(this._subChain);
                    this.prologueCalling(blockTask);
                }
            }
            else if (this._callMethod == STaskCallMethod.Iterator) {
                assert(this._iterator);
                const result = this._iterator.next();
                if (result.done) {
                    if (this._onIteratorFinalized) this._onIteratorFinalized(STaskYieldResult.Success);
                    // goto next.
                }
                else if (result.value == STaskYieldResult.Running) {
                    return true;
                }
                else if (result.value == STaskYieldResult.Reject) {
                    if (this._onIteratorFinalized) this._onIteratorFinalized(result.value);
                    // goto next.
                }
                else if (result.value == STaskYieldResult.Success) {
                    if (this._onIteratorFinalized) this._onIteratorFinalized(result.value);
                    // goto next.
                }
                else if (result.value == STaskYieldResult.Accept) {
                    if (this._onIteratorFinalized) this._onIteratorFinalized(result.value);
                    // goto next.
                }
                else {
                    throw new Error("Unreachable.");
                }
            }
            else {
                assert(this._catchFunc);
                this._catchFunc(this._subChain);
                this.prologueCalling(undefined);
            }
            cctx.popSubTaskChain(this._subChain);
        }

        return false;
    }

    public prologueCalling(blockTask: STask | void): void {
        assert(this._subChain);
        if (this._status != STaskStatus.Running) {
            // ハンドラ内でユーザーが明示的に next() や reject() した場合は、自動的な next() 呼び出しは不要。
        }
        else if (this._subChain._holding) {
            // hold() が呼ばれた場合、ユーザーは明示的に next() や reject() を呼ばなければならない。
        }
        else {  // 上記以外は自動的に next() する
            if (blockTask) {
                blockTask._blockingTask = this;
            }
            else {
                if (this._blockingTask) {
                    assert(this._blockingTask._subChain);
                    this._blockingTask._subChain.next();
                }
                this._subChain.next();
            }
        }
    }

    // ひとつでも実行中であれば Runnning, ひとつでも Rejected なら Rejected. すべて成功しているなら Succeeded.
    public checkWaitingTasksStatus(): STaskStatus {
        let status = STaskStatus.Succeeded;
        for (let task of this._whenWaitingTasks) {
            if (task._status == STaskStatus.Running) {
                status = STaskStatus.Running;
                break;
            }
            else if (task._status == STaskStatus.Handled) {
                status = STaskStatus.Handled;
                break;
            }
        }
        return status;
    }

    private setNextPriorityTaskIfNeeded(ctx: SCommandContext) {
        if (this._nextTask) {
            ctx._setNextPriorityTask(this._nextTask);
        }
    }
}



export enum STaskCallMethod {
    Default,    // deprecated
    Then,
    Catch,
    When,   // whenAll, whenAny 用のダミー Task
    Iterator,
}



enum STaskChainMethod {
    Next,
    Handled,
}

export enum STaskResult {
    Reject,
    Accept,
}

/**
 * コンストラクタで指定された Task の実行状態の管理及び、次の Task の実行を行う。
 * インスタンスは基本的に cctx.postTask() の時に作られる。
 * STask の then() したときには新しいインスタンスは作られない。
 */
export class SSubTaskChain {
    _ctx: SCommandContext;
    private _currentTask: STask | undefined;
    private _error: boolean;
    private _errorHandled: boolean;
    private _postedMethod: STaskChainMethod;
    _taskResult: STaskResult | undefined;
    private _postedChain: SSubTaskChain | undefined;
    _holding: boolean;
    
    public get allowReject(): boolean { return this._currentTask !== undefined && (this._currentTask.command === undefined || !this._currentTask.command.acceptRequired); }
    public get allowAccept(): boolean { return this._currentTask !== undefined && (this._currentTask.command !== undefined && this._currentTask.command.acceptRequired); }

    // /**
    //  * 明示的に accept() が呼ばれたときに、次の Task が実行されるようにするかどうか。
    //  */
    // requireExplicitAccept: boolean = false;

    public constructor(ctx: SCommandContext, task: STask) {
        this._ctx = ctx;
        this._currentTask = task;
        this._error = false;
        this._errorHandled = false;
        this._postedMethod = STaskChainMethod.Next;
        this._taskResult = undefined;//STaskResult.Accept;
        this._holding = false;
    }

    public hold(): void {
        this._holding = true;
    }

    public next(): void {
        this._postedMethod = STaskChainMethod.Next;
        this._holding = false;
        this.processOrPost();
    }
    
    public accept(): void {
        if (!this.allowAccept) throw new Error(tr2("このコマンド %1 では accept() は呼び出せません。").format(this.makeCommandName()));
        this.handleInternal(STaskResult.Accept);
    }

    public reject(): void {
        if (!this.allowReject) throw new Error(tr2("このコマンド %1 では reject() は呼び出せません。").format(this.makeCommandName()));
        this.handleInternal(STaskResult.Reject);
    }

    public handleInternal(taskResult: STaskResult): void {
        this._postedMethod = STaskChainMethod.Handled;
        this._taskResult = taskResult;
        this._holding = false;
        this.processOrPost();
    }

    private makeCommandName(): string {
        if (!this._currentTask) return "null";
        return this._currentTask.command ? this._currentTask.command.constructor.name : "anonymous";
    }

    private processOrPost(): void {
        const last = this._ctx._subTaskChainStack[this._ctx._subTaskChainStack.length - 1];
        if (last != this) {
            last._postedChain = this;
        }
        else {
            this.processInternal();
        }
    }

    private processInternal(): void {
        if (this._postedMethod == STaskChainMethod.Next) {
            this.nextInternal();
        }
        else if (this._postedMethod == STaskChainMethod.Handled) {
            this.handledInternal();
        }
        else {
            throw new Error("Unreachable.");
        }
    }

    private nextInternal(): void {
        assert(this._currentTask);
        this._currentTask._status = STaskStatus.Succeeded;

        if (this._error) {
            assert(this._currentTask._catchFunc || this._currentTask._finallyFunc); // catch または finally から実行できる

            // 次の finally へ
            let t: STask | undefined = this._currentTask._nextTask;
            this._currentTask = undefined;
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
            // いわゆる resolve()
            const next = this._currentTask._nextTask;
            this._currentTask = undefined;
            if (next && (next._thenFunc2 || next?._finallyFunc || next._iterator)) {
                next._callMethod = (next._iterator) ? STaskCallMethod.Iterator : STaskCallMethod.Then;
                this._ctx._setNextPriorityTask(next);
                this._currentTask = next;
            }
        }

        if (!this._currentTask) {
            this.close();
        }
    }
    
    private handledInternal(): void {
        assert(this._currentTask);
        assert(!this._errorHandled);
        this._error = true;
        this._currentTask._status = STaskStatus.Handled;

        // Task につながっている直近の catch を探してみる
        let t: STask | undefined = this._currentTask._nextTask;
        this._currentTask = undefined;
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

        if (!this._currentTask) {
            this.close();
        }
    }

    private close(): void {
        // assert(this._ctx._subTaskChainStack[this._ctx._subTaskChainStack.length - 1] == this);
        // this._ctx._subTaskChainStack.pop();
        if (this._postedChain) {
            this._postedChain.processInternal();
        }
    }
}
