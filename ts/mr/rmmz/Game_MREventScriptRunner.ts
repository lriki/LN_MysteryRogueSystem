import { tr2 } from "../Common";
import { DScript } from "../data/DScript";
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

    /**
     * この Entity が持つアクティブな選択肢を調べ、選択肢ウィンドウを表示します。
     */
    public showPostTalkDialog(): void {
        const sctx = this.scriptContext;
        const entity = sctx.entity;

        // NOTE: コモンイベントの呼び出し同様、子スクリプトを実行するときは Context を新しく作る。
        const s = new DScript(this._interpreter._list);
        const r = MRLively.scriptManager.callQuery(entity, s, "MRQuery-GetPostTalkCommands");
        const commands = r.talkingCommands;
        
        const choices = commands.map(x => x.displayName);
        const cancelIndex = commands.findIndex(x => x.label == "MRCommand-OnEndTalk");
        if (cancelIndex < 0) {
            commands.push({ label: "MRCommand-OnEndTalk", displayName: tr2("さようなら") });
        }

        // command102 (Show Choices) と同様の処理
        const cancelType = -2;
        const defaultType = 0;
        const positionType = 2;
        const background = 0;
        $gameMessage.setChoices(choices, defaultType, cancelType);
        $gameMessage.setChoiceBackground(background);
        $gameMessage.setChoicePositionType(positionType);
        $gameMessage.setChoiceCallback(n => {
            console.log("setChoiceCallback", n);

            // Jump to label
            const result = sctx.findListAndLabel(entity, commands[n].label);
            if (result) {
                if (result.list == this._interpreter._list) {
                    this._interpreter._index = result.index;
                }
                else {
                    this._interpreter.MR_resetList(result.list, result.index);
                }
            }

            // const index = LScriptContext.findLabelIndex(this._list, commands[n].label);
            // if (index >= 0) {
            //     this._index = index;
            // }
            //(this._branch as any)[this._indent] = n;
        });
        this._interpreter.setWaitMode("message");
    }
}
