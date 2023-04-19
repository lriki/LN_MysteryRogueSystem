import { assert, tr2 } from "../../Common";
import { DBehaviorInstantiation } from "../DBehavior";
import { DHelpers } from "../DHelper";
import { MRData } from "../MRData";

export class DMetadata {
    key: string;
    entityTemplateKey: string | undefined;
    effectKey: string | undefined;
    emittorKey: string | undefined;

    type: string;

    category: string;

    capacity: string | undefined;

    /** MR-Behavior */
    behaviors: DBehaviorInstantiation[];

    /** MR-Trait */
    traits: IDataTrait[];

    races: string[];

    public constructor() {
        this.key = "";
        this.effectKey = undefined;
        this.emittorKey = undefined;
        this.type = "";
        this.category = "";
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

        const category = meta["MR-Category"];
        if (category) {
            result.category = category.trim();
        }

        const key = meta["MR-Key"];
        if (key) {
            result.key = key.trim();
        }

        const entityTemplateKey = meta["MR-EntityTemplate"];
        if (entityTemplateKey) {
            result.entityTemplateKey = entityTemplateKey.trim();
        }
        
        const effectKey = meta["MR-EffectKey"];
        if (effectKey) {
            result.effectKey = effectKey.trim();
        }
        
        const emittorKey = meta["MR-EmittorKey"];
        if (emittorKey) {
            result.emittorKey = emittorKey.trim();
        }

        const capacity = meta["RE-Capacity"];
        if (capacity) {
            result.capacity = capacity.trim();
        }
        
        const behaviors = meta["MR-Behavior"];
        if (behaviors) {
            throw new Error("MR-Behavior is obsoleted. Pleaes edit /data/mr/EntityBehaviors.json instead.");
            // if (typeof(behaviors) == "string") {
            //     result.behaviors = this.parseMetadata_Behavior([behaviors]);
            // }
            // else {
            //     result.behaviors = this.parseMetadata_Behavior(behaviors);
            // }
        }

        const traits = meta["MR-Trait"];
        if (traits) {
            const list = ((traits instanceof Array) ? traits : [traits]) as string[];
            for (const data of list) {
                const c = DHelpers.parseConstructionExpr(data);
                result.traits.push({
                    code: MRData.getTrait(c.name).id,
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

    // private static parseMetadata_Behavior(meta: string[]): DBehaviorInstantiation[] {
    //     const result: DBehaviorInstantiation[] = [];
    //     for (const data of meta) {
    //         const expr = DHelpers.parseConstructionExpr(data);
    //         result.push(new DBehaviorInstantiation(MRData.getBehavior(expr.name).id, expr.args));
    //     }
    //     return result;
    // }
    
    
    private static parseTraitDataId(value: any): number {
        if (typeof value == 'string') {
            // 今のところ Param 名だけなのでそれを検索してみる
            const code = value.toLowerCase();
            const param = MRData.parameters.find(x => x.code == code);
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
