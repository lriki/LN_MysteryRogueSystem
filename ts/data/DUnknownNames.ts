import { assert } from "ts/Common";

interface NameEntry
{
    kind: string;
    names: string[];
}

export class DUnknownNames {
    private _names: Map<string, string[]>;

    public constructor() {
        this._names = new Map<string, string[]>();
    }
    
    public setup(data: any): void {
        const list = data as NameEntry[];
        for (const e of list) {
            this._names.set(e.kind, e.names);
        }
    }

    public kinds(): string[] {
        const result = [];
        for (const [k, v] of this._names) {
            result.push(k);
        }
        return result;
    }

    public nameList(kind: string): string[] | undefined {
        return this._names.get(kind);
    }

    public getNameList(kind: string): string[] {
        const list = this._names.get(kind);
        assert(list);
        return list;
    }
}
