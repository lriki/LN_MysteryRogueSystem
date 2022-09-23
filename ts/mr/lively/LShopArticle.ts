import { MRSerializable } from "../Common";
import { LStructureId } from "./LCommon";

@MRSerializable
export class LShopArticle {
    _ownerShopStructureId: LStructureId = 0;
    
    public isSalling(): boolean {
        return this._ownerShopStructureId > 0;
    }
}

