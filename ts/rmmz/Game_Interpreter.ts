import { REGame } from "../objects/REGame";

var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return REGame.challengeResultShowing;
    }
    else {
        return _Game_Interpreter_updateWaitMode.call(this);
    }
}


