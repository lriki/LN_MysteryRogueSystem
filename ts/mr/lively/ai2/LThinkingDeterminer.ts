import { SPhaseResult } from "ts/mr/system/SCommand";
import { LEntity } from "../LEntity";
import { LThinkingAgent } from "./LThinkingAgent";


export abstract class LThinkingDeterminer {
    public abstract clone(): LThinkingDeterminer;
    public abstract onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult;
}

