import { assert, tr2 } from "../../Common";
import { DEntity, IEntityProps } from "../DEntity";
import { DParameter } from "../DParameter";
import { MRBasics } from "../MRBasics";
import { MRData } from "../MRData";
import { DSkill, ISkillProps } from "../DSkill";
import { evalScript } from "./DSetupScripEvaluator";
import { IEffectProps } from "../DEffect";
import { IEmittorProps } from "../DEmittor";
import { IEntityTemplateProps } from "../DEntityTemplate";
import { IEntityCategoryProps } from "../DEntityCategory";





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

export class DSetupScriptDatabase {
    public parameters: { [key: string]: DSParameters };
    public entityCategories: { [key: string]: IEntityCategoryProps };
    public entityTemplates: { [key: string]: IEntityTemplateProps };
    public entities3: { [key: string]: DSEntity };
    public actions: { [key: string]: ISkillProps };
    public effects: { [key: string]: IEffectProps };
    public emittors: { [key: string]: IEmittorProps };
    public entities: { [key: string]: IEntityProps };

    public constructor() {
        this.parameters = {};
        this.entityCategories = {};
        this.entityTemplates = {};
        this.entities3 = {};
        this.actions = {};
        this.effects = {};
        this.emittors = {};
        this.entities = {};
    }

    public mergeFrom(other: DSetupScriptDatabase): void {
        Object.assign(this.parameters, other.parameters);
        Object.assign(this.entityCategories, other.entityCategories);
        Object.assign(this.entityTemplates, other.entityTemplates);
        Object.assign(this.entities3, other.entities3);
        Object.assign(this.actions, other.actions);
        Object.assign(this.effects, other.effects);
        Object.assign(this.emittors, other.emittors);
        Object.assign(this.entities, other.entities);
    }
}

export var db: DSetupScriptDatabase | undefined;
export function setDB(v: DSetupScriptDatabase | undefined) {
    db = v;
}

interface RequireOverrideReturn {
    MRData: typeof MRData;
    MRBasics: typeof MRBasics;
    mrdb: typeof db;
};

export class DSetupScript {
    private _mainDB: DSetupScriptDatabase;

    public constructor() {
        this._mainDB = new DSetupScriptDatabase();
    }

    public addScript(script: string): void {
        const db = new DSetupScriptDatabase();
        evalScript(db, script);
        this._mainDB.mergeFrom(db);
    }

    public registerData(): void {
        for (const key in this._mainDB.parameters) {
            if (!MRData.parameters.find(x => x.key == key)) {
                MRData.addParams(key, "");
            }
        }

    }
    
    public setupData(): void {
        this.createEntityCategories();
        this.createActions();
        this.createEffects();
        this.createEmittors();
        this.createEntityTemplates();
        this.createEntities();

        for (const data of MRData.parameters) {
            const entry = this._mainDB.parameters[data.key];
            if (entry) {
                entry.setup(data);
            }
        }
        // for (const data of MRData.skills.filter(x => x.isActivity)) {
        //     const props = db.actions[data.key];
        //     if (props) {
        //         props.setup(data);
        //     }
        // }

        this.setupEntityCategories();
        this.setupActions();
        this.setupEffects();
        this.setupEmittors();
        this.setupEntityTemplates();
        this.setupEntities();
    }

    private createEntityCategories(): void {
        for (const [key, props] of Object.entries(this._mainDB.entityCategories)) {
            if (!MRData.categories.find(x => x.key == key)) {
                MRData.newEntityCategory(key);
            }
        }
    }

    private setupEntityCategories(): void {
        for (const data of MRData.categories) {
            const props = this._mainDB.entityCategories[data.key];
            if (props) {
                data.applyProps(props);
            }
        }
    }

    private createEffects(): void {
        for (const [key, props] of Object.entries(this._mainDB.effects)) {
            if (!MRData.effects.find(x => x.key == key)) {
                MRData.newEffect(key);
            }
        }
    }

    private setupEffects(): void {
        for (const data of MRData.effects) {
            const props = this._mainDB.effects[data.key];
            if (props) {
                data.applyProps(props);
            }
        }
    }

    private createEmittors(): void {
        if (!this._mainDB.emittors) return;
        for (const [key, props] of Object.entries(this._mainDB.emittors)) {
            if (!MRData.emittors.find(x => x.key == key)) {
                MRData.newEmittor(key);
            }
        }
    }

    private setupEmittors(): void {
        if (!this._mainDB.emittors) return;
        for (const data of MRData.emittors) {
            const props = this._mainDB.emittors[data.key];
            if (props) {
                data.applyProps(props);
            }
        }
    }

    private createActions(): void {
        if (!this._mainDB.actions) return;
        for (const [key, props] of Object.entries(this._mainDB.actions)) {
            if (!MRData.skills.find(x => x.key == key)) {
                MRData.newEmittor(key);
            }
        }
    }

    private setupActions(): void {
        if (!this._mainDB.actions) return;
        for (const data of MRData.skills) {
            const props = this._mainDB.actions[data.key];
            if (props) {
                data.applyProps(props);
            }
        }
    }

    private createEntityTemplates(): void {
        if (!this._mainDB.entityTemplates) return;
        for (const [key, props] of Object.entries(this._mainDB.entityTemplates)) {
            if (!MRData.entityTemplates.find(x => x.key == key)) {
                MRData.newEntityTemplate(key, props);
            }
        }
    }

    private setupEntityTemplates(): void {
        if (!this._mainDB.entityTemplates) return;
        for (const data of MRData.entityTemplates) {
            const props = this._mainDB.entityTemplates[data.key];
            if (props) {
                data.resetProps(props);
            }
        }
    }

    private createEntities(): void {
        if (!this._mainDB.entities) return;
        for (const [key, props] of Object.entries(this._mainDB.entities)) {
            if (!MRData.entities.find(x => x.entity.key == key)) {
                const e = MRData.newEntity();
                e.entity.key = key;
            }
        }
    }

    private setupEntities(): void {
        if (!this._mainDB.entities) return;
        for (const data of MRData.entities) {
            if (data.entityTemplateKey) {
                const entityTemplates = MRData.getEntityTemplate(data.entityTemplateKey);
                entityTemplates.applyTo(data);
            }

            const props = this._mainDB.entities[data.entity.key];
            if (props) {
                data.applyProps(props);
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
            const data = this._mainDB.entities3[entity.entity.key];
            if (data) {
                data.setup(entity);
            }
        }
    }
}

