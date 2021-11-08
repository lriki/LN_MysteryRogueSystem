import { RESerializable } from "ts/re/Common";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LStructureId } from "../LCommon";
import { LEntity } from "../LEntity";


@RESerializable
export class LStructure {
    _id: LStructureId;

    public constructor(id: LStructureId) {
        this._id = id;
    }

    public id(): LStructureId {
        return this._id;
    }

    onEntityLocated(cctx: SCommandContext, entity: LEntity): void {

    }
}

