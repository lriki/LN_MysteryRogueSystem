import { RECommand, REResponse } from "./RECommand";
import { REData, REData_Action } from "../data/REData";
import { REDialog } from "./REDialog";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REScheduler } from "./REScheduler";
import { assert } from "ts/Common";


type RECCMessage = () => REResponse;


export class RECommandContext
{
    private _owner: REScheduler;
    private _visualAnimationWaiting: boolean = false;
    private _recodingCommandList: RECCMessage[] = [];
    private _runningCommandList: RECCMessage[] = [];
    private _messageIndex: number = 0;
    private _lastResponce: REResponse = REResponse.Pass;

    constructor(owner: REScheduler) {
        this._owner = owner;
    }

    postAction(action: REData_Action, actor: REGame_Entity, reactor: REGame_Entity | undefined, cmd?: RECommand) {
        assert(action);

        const actualCommand = cmd ? cmd : new RECommand();
        actualCommand.setup(action, actor, reactor);

        const m1 = () => {
            return actor._sendPreAction(actualCommand);
        }
        this._recodingCommandList.push(m1);

        if (reactor) {
            const m2 = () => {
                if (this._lastResponce == REResponse.Pass)  // m1 で未処理なら send
                    return reactor._sendPreRection(actualCommand);
                else
                    return this._lastResponce;
            }
            this._recodingCommandList.push(m2);
        }

        const m3 = () => {
            if (this._lastResponce == REResponse.Pass)  // m2 で未処理なら send
                return actor._sendAction(actualCommand);
            else
                return this._lastResponce;
        }
        this._recodingCommandList.push(m3);

        if (reactor) {
            const m4 = () => {
                if (this._lastResponce == REResponse.Pass)  // m3 で未処理なら send
                    return reactor._sendReaction(actualCommand);
                else
                    return this._lastResponce;
            }
            this._recodingCommandList.push(m4);
        }
    }

    openDialog(dialogModel: REDialog): void {
        const m1 = () => {
            this._owner._openDialogModel(dialogModel);
            return REResponse.Consumed;
        }
        this._recodingCommandList.push(m1);
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

    _process(): boolean {
        if (this.isRunning()) {
            // コマンドリスト実行中
            this._processCommand();
        }
        
        if (!this.isRunning() && this._recodingCommandList.length > 0) {
            // _runningCommandList は終了したが、_recodingCommandList に次のコマンドチェーンが溜まっていればそれの実行を始める
            this._submit();
        }

        // _runningCommandList にも _recodingCommandList にもコマンドが無ければ false を返して、スケジューリングフェーズを次に進める
        return this.isRunning();
    }

    _processCommand() {
        if (this.isRunning()) {
            const message = this._runningCommandList[this._messageIndex];
            const response = message();
    
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
        this._messageIndex++;
    }

    _submit() {
        // swap
        [this._runningCommandList, this._recodingCommandList] = [this._recodingCommandList, this._runningCommandList];

        // clear
        this._recodingCommandList.splice(0);
        this._messageIndex = 0;
    }

}


