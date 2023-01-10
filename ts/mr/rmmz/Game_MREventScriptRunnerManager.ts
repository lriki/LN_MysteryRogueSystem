import { assert } from "../Common";
import { LScriptContext } from "../lively/LScript";
import { Game_MREventScriptRunner } from "./Game_MREventScriptRunner";

export class Game_MREventScriptRunnerManager {
    public _eventScriptRunners: (Game_MREventScriptRunner | undefined)[];

    constructor() {
        this._eventScriptRunners = [];
    }

    public getRunner(runnerId: number): Game_MREventScriptRunner {
        const runner = this._eventScriptRunners[runnerId];
        assert(runner);
        return runner;
    }

    public isAnyRunning(): boolean {
        for (const runner of this._eventScriptRunners) {
            if (runner) {
                return true;
            }
        }
        return false;
    }

    public start(script: LScriptContext): void {
        const runner = new Game_MREventScriptRunner(script);
        this._eventScriptRunners[script.id] = runner;
        
        // Query では即実行したい。context を取るため、 _eventScriptRunners に add してから実行する。
        runner.update();
    }

    public update(): void {
        for (const runner of this._eventScriptRunners) {
            if (runner) {
                runner.update();
                if (!runner.isRunning) {
                    this.onEnd(runner);
                }
            }
        };
    }

    private onEnd(runner: Game_MREventScriptRunner): void {
        console.log("onEnd", runner);
        this._eventScriptRunners[runner.scriptId] = undefined;
    }
}

