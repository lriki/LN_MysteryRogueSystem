import { LEntity } from "../lively/LEntity";
import { SCommand } from "./SCommand";
import { SCommandContext } from "./SCommandContext";
import { SSubTaskChain } from "./tasks/STask";

export class SDefaultCommandHandler {

    public static onCommand(entity: LEntity, cctx: SCommandContext, chain: SSubTaskChain, cmd: SCommand): void {
    }
    
}
