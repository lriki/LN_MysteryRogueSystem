import { MRSerializable } from "ts/mr/Common";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LStructureId } from "../LCommon";
import { LEntity } from "../entity/LEntity";


@MRSerializable
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

