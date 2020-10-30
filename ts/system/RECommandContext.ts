import { RECommand, REResponse } from "./RECommand";
import { REData, REData_Action } from "../data/REData";
import { REDialog } from "./REDialog";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REScheduler } from "./REScheduler";
import { assert, Log } from "ts/Common";
import { REGame_Sequel } from "ts/RE/REGame_Sequel";

interface RECCMessage {
    name: string;   // for debug
    func: () => REResponse;
}

export class RECommandContext
{
    private _owner: REScheduler;
    private _visualAnimationWaiting: boolean = false;   // 不要かも
    private _recodingCommandList: RECCMessage[] = [];
    private _runningCommandList: RECCMessage[] = [];
    private _messageIndex: number = 0;
    private _lastResponce: REResponse = REResponse.Pass;
    private _commandChainRunning: boolean = false;

    constructor(owner: REScheduler) {
        this._owner = owner;
    }

    postAction(actionId: number, actor: REGame_Entity, reactor: REGame_Entity | undefined, args?: any) {
        assert(actionId > 0);

        const actualCommand = new RECommand(actionId, actor, reactor, args);

        const m1 = () => {
            Log.doCommand("PreAction");
            return actor._sendPreAction(this, actualCommand);
        };
        this._recodingCommandList.push({ name: "sendPreAction", func: m1 });

        if (reactor) {
            const m2 = () => {
                if (this._lastResponce == REResponse.Pass) {  // m1 で未処理なら send
                    Log.doCommand("PreRection");
                    return reactor._sendPreRection(this, actualCommand);
                }
                else
                    return this._lastResponce;
            };
            this._recodingCommandList.push({ name: "sendPreRection", func: m2 });
        }

        const m3 = () => {
            if (this._lastResponce == REResponse.Pass) {  // m2 で未処理なら send
                Log.doCommand("Action");
                return actor._sendAction(this, actualCommand);
            }
            else
                return this._lastResponce;
        };
        this._recodingCommandList.push({ name: "sendAction", func: m3 });

        if (reactor) {
            const m4 = () => {
                if (this._lastResponce == REResponse.Pass) {  // m3 で未処理なら send
                    Log.doCommand("Reaction");
                    return reactor._sendReaction(this, actualCommand);
                }
                else
                    return this._lastResponce;
            };
            this._recodingCommandList.push({ name: "sendReaction", func: m4 });
        }
        
        Log.postCommand("postAction");
    }

    openDialog(causeEntity: REGame_Entity, dialogModel: REDialog): void {
        const m1 = () => {
            Log.doCommand("OpenDialog");
            this._owner._openDialogModel(causeEntity, dialogModel);
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "openDialog", func: m1 });

        Log.postCommand("openDialog");
    }

    postSequel(entity: REGame_Entity, sequelId: number) {
        const m1 = () => {
            Log.doCommand("Sequel");
            this._owner.addSequel(new REGame_Sequel(entity, sequelId));
            this._visualAnimationWaiting = true;
            return REResponse.Consumed;
        };
        this._recodingCommandList.push({ name: "postSequel", func: m1 });

        Log.postCommand("postSequel");
    }

    visualAnimationWaiting(): boolean {
        return this._visualAnimationWaiting;
    }

    clearVisualAnimationWaiting(): void {
        this._visualAnimationWaiting = false;
    }
    
    isRunning(): boolean {
        return this._messageIndex < this._runningCommandList.length;
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
    
            if (this._owner._getDialogContext()._hasDialogModel()) {
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


