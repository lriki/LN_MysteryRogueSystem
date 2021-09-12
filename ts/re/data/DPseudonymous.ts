import { assert } from "ts/re/Common";
import { DEntityKind, DEntityKindId } from "./DEntityKind";
import { REData } from "./REData";

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
            const kind = REData.getEntityKind(e.kind);
            this._names[kind.id] = { names: e.names };
        }
    }

    public kinds(): DEntityKind[] {
        const result = [];
        for (let i = 0; i < this._names.length; i++) {
            if (this._names[i]) {
                result.push(REData.entityKinds[i]);
            }
        }
        return result;
    }

    public nameList(kindId: DEntityKindId): string[] | undefined {
        const e = this._names[kindId];
        if (e)
            return e.names;
        else
            return undefined;
    }

    public getNameList(kindId: DEntityKindId): string[] {
        const list = this.nameList(kindId);
        assert(list);
        return list;
    }
}