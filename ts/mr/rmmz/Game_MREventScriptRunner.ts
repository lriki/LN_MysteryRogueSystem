import { LScriptContext, LScriptId } from "../lively/LScript";
import { MRLively } from "../lively/MRLively";
import { MRSystem } from "../system/MRSystem";

export class Game_MREventScriptRunner {
    public readonly scriptId: LScriptId;
    private _interpreter: Game_Interpreter;

    public constructor(script: LScriptContext) {
        this.scriptId = script.id;
        this._interpreter = new Game_Interpreter();
        this._interpreter._MR_EventScriptRunnerId = script.id;
        this._interpreter.setup(script.list, 0);

        // ProgramCounter を label に合わせる。
        const index = LScriptContext.findLabelIndex(script.list, script.label);
        if (index >= 0) {
            this._interpreter._index = index;
        }
    }

    public get isRunning(): boolean {
        return this._interpreter.isRunning();
    }

    public get scriptContext(): LScriptContext {
        return MRLively.scriptManager.getScriptContext(this.scriptId);
    }

    public update(): void {
        this._interpreter.update();
    }

    
    //------------------------------------------------------------------------------
    // 以下、イベントのスクリプトから呼び出すためのもの。
    // 量が非常に多くなることが予想されるため、プラグインコマンドとは別に定義している。

    public setQuestIcon(questIconKey: string) {
        this.scriptContext.questIconKey = questIconKey;
    }

    public openQuest(questKey: string): void {
        MRSystem.questManager.openQuest(questKey);
        $gameMap.refresh();
    }

    public isQuestInactived(questKey: string): boolean {
        return MRLively.questManager.isQuestInactived(questKey);
    }

    public isQuestTaskAcivated(questTaskKey: string): boolean {
        return MRLively.questManager.isQuestTaskAcivated(questTaskKey);
    }
}
