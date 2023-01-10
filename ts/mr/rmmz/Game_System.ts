import { Game_MREventScriptRunnerManager } from "./Game_MREventScriptRunnerManager";


declare global {
    interface Game_System {
        _MR_MREventScriptRunnerManager: Game_MREventScriptRunnerManager | undefined;
        getMREventScriptRunnerManager(): Game_MREventScriptRunnerManager;
    }
}

Game_System.prototype.getMREventScriptRunnerManager = function(): Game_MREventScriptRunnerManager {
    if (!this._MR_MREventScriptRunnerManager) {
        this._MR_MREventScriptRunnerManager = new Game_MREventScriptRunnerManager();
    }
    return this._MR_MREventScriptRunnerManager;
}