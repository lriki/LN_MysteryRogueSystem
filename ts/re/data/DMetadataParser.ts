import { assert, tr2 } from "../Common";
import { DBehaviorInstantiation } from "./DEntityProperties";
import { DHelpers } from "./DHelper";
import { DTroopId } from "./DTroop";
import { REData } from "./REData";

export class DMetadata {
    key: string;

    type: string;

    kind: string;

    capacity: string | undefined;

    /** MR-Behavior */
    behaviors: DBehaviorInstantiation[];

    /** MR-Trait */
    traits: IDataTrait[];

    races: string[];

    public constructor() {
        this.key = "";
        this.type = "";
        this.kind = "";
        this.behaviors = [];
        this.traits = [];
        this.races = [];
    }
}

export class DMetadataParser {

    public static parse(meta: any | undefined): DMetadata {
        const result = new DMetadata();
        if (!meta) return result;

        const type = meta["MR-Type"];
        if (type) {
            result.type = type.trim();
        }

        const kind = meta["MR-Kind"];
        if (kind) {
            result.kind = kind.trim();
        }

        const key = meta["MR-Key"];
        if (key) {
            result.key = key.trim();
        }

        const capacity = meta["RE-Capacity"];
        if (capacity) {
            result.capacity = capacity.trim();
        }
        
        const behaviors = meta["MR-Behavior"];
        if (behaviors) {
            if (typeof(behaviors) == "string") {
                result.behaviors = this.parseMetadata_Behavior([behaviors]);
            }
            else {
                result.behaviors = this.parseMetadata_Behavior(behaviors);
            }
        }

        const traits = meta["MR-Trait"];
        if (traits) {
            const list = ((traits instanceof Array) ? traits : [traits]) as string[];
            for (const data of list) {
                const c = DHelpers.parseConstructionExpr(data);
                result.traits.push({
                    code: REData.getTrait(c.name).id,
                    dataId: this.parseTraitDataId(c.args[0]),
                    value: Number(c.args[1]),
                });
            }
        }

        const races = meta["MR-Race"];
        if (races) {
            const list = ((races instanceof Array) ? races : [races]) as string[];
            for (const data of list) {
                result.races.push(data.trim());
            }
        }

        return result;
    }

    private static parseMetadata_Behavior(meta: string[]): DBehaviorInstantiation[] {
        const result: DBehaviorInstantiation[] = [];
        for (const data of meta) {
            result.push(DHelpers.parseConstructionExpr(data));
        }
        return result;
    }
    
    
    private static parseTraitDataId(value: any): number {
        if (typeof value == 'string') {
            // 今のところ Param 名だけなのでそれを検索してみる
            const code = value.toLowerCase();
            const param = REData.parameters.find(x => x.code == code);
            if (param) {
                return param.id;
            }
            else {
                throw new Error(tr2("Trait に指定されているパラメータ名 %1 は不正です。").format(value));
            }
        }
        else {
            return Number(value);
        }
    }
    
}
