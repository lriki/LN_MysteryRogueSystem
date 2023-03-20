import { MRSerializable } from "ts/mr/Common";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingAgent } from "./LThinkingAgent";
import { LThinkingContext } from "./LThinkingContext";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { LThinkingDeterminer_Combat } from "./LThinkingDeterminer_Combat";
import { LThinkingDeterminer_Wandering } from "./LThinkingDeterminer_Wandering";

@MRSerializable
export class LThinkingAgent_Standard extends LThinkingAgent {

    public constructor() {
        super(0, [
            new LThinkingDeterminer_Wandering(),
            new LThinkingDeterminer_Combat(),
        ]);
    }
}

