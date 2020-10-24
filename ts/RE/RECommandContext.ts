import { RECommand, REResponse } from "./RECommand";
import { REData, REData_Action } from "./REData";
import { REGame_Entity } from "./REGame_Entity";


type RECCMessage = () => REResponse;


export class RECommandContext
{
    private _visualAnimationWaiting: boolean = false;
    private _messageList: RECCMessage[] = [];
    private _lastResponce: REResponse = REResponse.Pass;

    postAction(action: REData_Action, actor: REGame_Entity, reactor: REGame_Entity, cmd?: RECommand) {
        const actualCommand = cmd ? cmd : new RECommand();
        actualCommand.setup(action, actor, reactor);

        const m1 = () => {
            return actor._sendPreAction(actualCommand);
        }
        this._messageList.push(m1);

        const m2 = () => {
            if (this._lastResponce == REResponse.Pass)
                return reactor._sendPreRection(actualCommand);
            else
                return this._lastResponce;
        }
        this._messageList.push(m2);

        const m3 = () => {
            if (this._lastResponce == REResponse.Pass)
                return actor._sendAction(actualCommand);
            else
                return this._lastResponce;
        }
        this._messageList.push(m3);

        const m4 = () => {
            if (this._lastResponce == REResponse.Pass)
                return reactor._sendReaction(actualCommand);
            else
                return this._lastResponce;
        }
        this._messageList.push(m4);
    }


    visualAnimationWaiting(): boolean {
        return this._visualAnimationWaiting;
    }

    clearVisualAnimationWaiting(): void {
        this._visualAnimationWaiting = false;
    }
    
    isRunning(): boolean {
        return false;   // TODO:
    }



}


