import { LScriptContext, LScriptId } from "../lively/LScript";
import { MRLively } from "../lively/MRLively";

export class Game_MREventScriptRunner {
    public readonly scriptId: LScriptId;
    private _interpreter: Game_Interpreter;

    public constructor(script: LScriptContext) {
        this.scriptId = script.id;
        this._interpreter = new Game_Interpreter();
        this._interpreter._MR_EventScriptRunnerId = script.id;
        this._interpreter.setup(script.list, 0);

        console.log("new Game_MREventScriptRunner", script.id);

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
}
