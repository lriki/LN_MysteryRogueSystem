import { LStructureId } from "./LCommon";

export class LShopArticle {
    _ownerShopStructureId: LStructureId = 0;
    
    public isSalling(): boolean {
        return this._ownerShopStructureId > 0;
    }
}

