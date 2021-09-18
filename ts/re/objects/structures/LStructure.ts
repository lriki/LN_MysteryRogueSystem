import { RESerializable } from "ts/re/Common";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";


@RESerializable
export class LStructure {
    onEntityLocated(context: SCommandContext, entity: LEntity): void {

    }
}

