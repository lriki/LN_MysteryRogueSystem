import { assert, tr2 } from "../../Common";
import { DEntity } from "../DEntity";
import { DParameter } from "../DParameter";
import { MRBasics } from "../MRBasics";
import { MRData } from "../MRData";
import * as index from "../index";
import { DSkill } from "../DSkill";


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



export interface DSParameters {
    setup: (parameter: DParameter) => void;
}

export interface DSetupAction {
    setup: (skill: DSkill) => void;
}

export interface DSEntity {
    /*
    baseOn (共通設定の継承) について
    ----------
    これは実装しない。これはツクールのデータ構造に寄せた時に、継承のルール決めが難しいため。
    多くの設定は何らかの値の入力が必須であり、「継承する」という考えがない。そのため代案を考えても、設定が紛らわしくなる。
    例えば武器の [ダメージ計算] を "なし" の場合、共通データを継承するという仕様にしてみると、
    - "なし" という字面からは継承を想像できない。
    - ベースの設定を使うのか、本当に "なし" にするのか、どちらかが分からない。
    設定ファイルは .js として、コードとして書くことを想定しているため、そちらで共通設定を行う関数を呼び出すことで、設定することにしてみる。
    */
    setup: (entity: DEntity) => void;
}

export class db {
    public static parameters: { [key: string]: DSParameters };
    public static actions: { [key: string]: DSetupAction };
    public static entities: { [key: string]: DSEntity };
}


interface RequireOverrideReturn {
    MRData: typeof MRData;
    MRBasics: typeof MRBasics;
    mrdb: typeof db;
};

export class DSetupScript {
    //private _db: DSetupScriptDB;

    public constructor() {
        // let db: any = {};
        // for (const script of scripts) {
        // }
        // assert(db);
        // this._db = db;
    }

    public addScript(script: string): void {
        // let require = function(f: string): RequireOverrideReturn {
        //     return {
        //         MRData: MRData,
        //         mrdb: mrdb,
        //         MRBasics: MRBasics,
        //     };
        // };
        const require = function(f: string): any {
            return index;
        };
        const tr = tr2;
        eval(script);
    }

    public registerData(): void {
        for (const key in db.parameters) {
            if (!MRData.parameters.find(x => x.key == key)) {
                MRData.addParams(key, "");
            }
        }

    }
    
    public setupData(): void {
        for (const data of MRData.parameters) {
            const entry = db.parameters[data.key];
            if (entry) {
                entry.setup(data);
            }
        }
        for (const data of MRData.skills.filter(x => x.isActivity)) {
            const entry = db.actions[data.key];
            if (entry) {
                entry.setup(data);
            }
        }
    }

    public setupItem(entity: DEntity): void {

        // {
        //     const data: DSetupScriptDB_Entity = this._db.entities[entity.entity.key];
        //     if (data) {
        //         if (data.descriptions) {
        //             const text = data.descriptions.join("\n");
        //             entity.description = text;
        //         }
    
        //         if (data.equipmentTraits) {
        //             for (const t of data.equipmentTraits) {
        //                 const traitData = MRData.getTrait(t.code);
        //                 const trait: IDataTrait = {
        //                     code: traitData.id,
        //                     dataId: 0,
        //                     value: t.value ?? 0,
        //                 };
    
        //                 // Convert data
        //                 if (t.data) {
        //                     switch (traitData.id) {
        //                         case MRBasics.traits.RaceRate:
        //                             trait.dataId = MRData.getRace(t.data).id;
        //                             break;
        //                     }
        //                 }
    
        //                 entity.equipmentTraits.push(trait);
        //             }
        //         }
        //     }

        // }

        {
            const data = db.entities[entity.entity.key];
            if (data) {
                data.setup(entity);
            }
        }


    }
}

