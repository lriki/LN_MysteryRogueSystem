import { assert } from "ts/mr/Common";
import { DEntityCategoryId } from "./DCommon";
import { DEntityCategory } from "./DEntityCategory";
import { MRData } from "./MRData";

interface NameEntry
{
    kind: string;
    names: string[];
}

interface NameEntry2 {
    names: string[];
}

export class DPseudonymous {
    private _names: (NameEntry2 | undefined)[];   // index: DEntityKindId

    public constructor() {
        this._names = [];
    }
    
    public setup(data: any): void {
        const list = data as NameEntry[];
        for (const e of list) {
            const kind = MRData.getEntityCategory(e.kind);
            this._names[kind.id] = { names: e.names };
        }
    }

    public kinds(): DEntityCategory[] {
        const result = [];
        for (let i = 0; i < this._names.length; i++) {
            if (this._names[i]) {
                result.push(MRData.categories[i]);
            }
        }
        return result;
    }

    public nameList(kindId: DEntityCategoryId): string[] | undefined {
        const e = this._names[kindId];
        if (e)
            return e.names;
        else
            return undefined;
    }

    public getNameList(kindId: DEntityCategoryId): string[] {
        const list = this.nameList(kindId);
        assert(list);
        return list;
    }
}
