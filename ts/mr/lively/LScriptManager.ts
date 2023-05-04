import { assert } from "../Common";
import { DScript } from "../data/DScript";
import { MRSystem } from "../system/MRSystem";
import { LEntity } from "./entity/LEntity";
import { LScriptContext, LScriptCallMode, LScriptId } from "./LScript";


export class LScriptManager {
    private _scriptContexts: (LScriptContext | undefined)[];

    public constructor() {
        this._scriptContexts = [undefined];  // [0] is dummy.
    }

    public getScriptContext(id: LScriptId): LScriptContext {
        const script = this._scriptContexts[id];
        assert(script);
        return script;
    }

    public callQuery(entity: LEntity | undefined, finalClassScript: DScript, label: string): LScriptContext {
        const id = this.getId();
        const script = new LScriptContext(id, entity, finalClassScript, label, LScriptCallMode.Query);
        if (script.isValid) {
            this._scriptContexts[id] = script;
            MRSystem.integration.onStartEventScript(script);
        }
        return script;
    }

    public callCommand(entity: LEntity | undefined, finalClassScript: DScript, label: string): boolean {
        const id = this.getId();
        const script = new LScriptContext(id, entity, finalClassScript, label, LScriptCallMode.Command);
        if (script.isValid) {
            this._scriptContexts[id] = script;
            MRSystem.integration.onStartEventScript(script);
            return true;
        }
        return false;
    }

    private getId(): LScriptId {
        for (let i = 1; i < this._scriptContexts.length; i++) {
            if (!this._scriptContexts[i]) {
                return i;
            }
        }
        return this._scriptContexts.length;
    }
}
