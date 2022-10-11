import { assert, tr2 } from "ts/mr/Common";
import { LEntity } from "ts/mr/lively/LEntity";
import { EntityIdentificationLevel } from "ts/mr/lively/LIdentifyer";
import { MRLively } from "ts/mr/lively/MRLively";
import { UName } from "ts/mr/utility/UName";
import { SDialog } from "../SDialog";

export class SDetailsDialog extends SDialog {
    private _entity: LEntity;

    public constructor(entity: LEntity) {
        super();
        this._entity = entity;
    }

    public entity(): LEntity {
        return this._entity;
    }

    public get summary(): string {
        return UName.makeNameAsItem(this._entity);
    }

    public get description(): string {
        const subject = MRLively.camera.focusedEntity();
        assert(subject);
        if (MRLively.identifyer.getEntityIdentificationLevel(subject, this._entity) == EntityIdentificationLevel.Unidentified) {
            return tr2("このアイテムは識別されていません。");
        }
        else {
            return this._entity.data.description;
        }
    }
}
