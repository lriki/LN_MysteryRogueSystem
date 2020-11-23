import { REGame } from "../objects/REGame";


var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command: string, args: string[]) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    
    switch (command) {
        case 'REEx.GoalDungeon':
            break;
            /*
            switch (args[0]) {
                case 'call':
                    $gameMap.spawnMapSkillEffectEvent(args[1]);
                    break;
            }
            */
    }

    //AMPSManager.pluginCommand(command, args);
}

var _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function(): boolean {
    if (this._waitMode == "REResultWinodw") {
        return REGame.challengeResultShowing;
    }
    else {
        return _Game_Interpreter_updateWaitMode.call(this);
    }
}

const pluginName: string = "LN_RoguelikeEngine";

PluginManager.registerCommand(pluginName, "RESystem.ShowChallengeResult", (args: any) => {
    REGame.challengeResultShowing = true;
    $gameMap._interpreter.setWaitMode("REResultWinodw");
});


