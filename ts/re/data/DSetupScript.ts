import { assert } from "../Common";
import { DEntity } from "./DEntity";
import { REBasics } from "./REBasics";
import { REData } from "./REData";



interface DSetupScriptDB_Trait {
    code: string;
    data?: string;
    value?: number;
}

interface DSetupScriptDB_Entity {
    descriptions?: string[];
    equipmentTraits?: DSetupScriptDB_Trait[];
}

interface DSetupScriptDB {
    entities: any,
}

export class DSetupScript {
    private _db: DSetupScriptDB;

    public constructor(script: string) {
        let db: any = {};
        eval(script);
        assert(db);
        this._db = db;
        
        if (db.items) {
            const aa = db.items["kワープリング"];
            const abba = db.items["xxx"];
            console.log("aa", aa);


        }
    }

    public setupItem(entity: DEntity): void {
        const data: DSetupScriptDB_Entity = this._db.entities[entity.entity.key];
        if (data) {
            if (data.descriptions) {
                const text = data.descriptions.join("\n");
                entity.description = text;
            }

            if (data.equipmentTraits) {
                for (const t of data.equipmentTraits) {
                    const traitData = REData.getTrait(t.code);
                    const trait: IDataTrait = {
                        code: traitData.id,
                        dataId: 0,
                        value: t.value ?? 0,
                    };

                    // Convert data
                    if (t.data) {
                        switch (traitData.id) {
                            case REBasics.traits.RaceRate:
                                trait.dataId = REData.getRace(t.data).id;
                                break;
                        }
                    }

                    entity.equipmentTraits.push(trait);
                }
            }
        }
    }
}

