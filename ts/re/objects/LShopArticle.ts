import { RESerializable } from "../Common";
import { LStructureId } from "./LCommon";

@RESerializable
export class LShopArticle {
    _ownerShopStructureId: LStructureId = 0;
    
    public isSalling(): boolean {
        return this._ownerShopStructureId > 0;
    }
}

