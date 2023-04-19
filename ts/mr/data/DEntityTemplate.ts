import { assert } from "../Common";
import { DEntityTemplateId } from "./DCommon";
import { DEntity } from "./DEntity";
import { MRSetup } from "./MRSetup";

export class DEntityTemplate {
    public readonly id: DEntityTemplateId;
    public readonly key: string;
    private _props: IEntityTemplateProps;

    constructor(id: DEntityTemplateId, key: string, props: IEntityTemplateProps) {
        this.id = id;
        this.key = key;
        this._props = props;
    }

    public get props(): IEntityTemplateProps {
        return this._props;
    }

    public resetProps(props: IEntityTemplateProps): void {
        assert(this.props.type == props.type);
        this._props = props;
    }

    public applyTo(entity: DEntity): void {
        switch (this.props.type) {
            case "null":
                break;
            case "Weapon":
                this.applyTo_Weapon(entity);
                break;
            case "Shield":
                this.applyTo_Shield(entity);
                break;
            case "Armor":
                this.applyTo_Armor(entity);
                break;
            case "Accessory":
                this.applyTo_Accessory(entity);
                break;
            case "Grass":
                this.applyTo_Grass(entity);
                break;
            case "Food":
                this.applyTo_Food(entity);
                break;
            case "Storage":
                this.applyTo_Storage(entity);
                break;
            default:
                assert(false);
        }
    }

    private applyTo_Weapon(entity: DEntity): void {
        assert(this.props.type == "Weapon");
        MRSetup.setupWeaponCommon(entity);
    }

    private applyTo_Shield(entity: DEntity): void {
        assert(this.props.type == "Shield");
        MRSetup.setupShieldCommon(entity);
    }

    private applyTo_Armor(entity: DEntity): void {
        assert(this.props.type == "Armor");
    }

    private applyTo_Accessory(entity: DEntity): void {
        assert(this.props.type == "Accessory");
    }

    private applyTo_Grass(entity: DEntity): void {
        assert(this.props.type == "Grass");
        MRSetup.setupGrassCommon(entity, this.props.recoverFP);
    }

    private applyTo_Food(entity: DEntity): void {
        assert(this.props.type == "Food");
        MRSetup.setupFoodCommon(entity);
    }

    private applyTo_Storage(entity: DEntity): void {
        assert(this.props.type == "Storage");
        MRSetup.setupStorageCommon(entity);
    }
}


//------------------------------------------------------------------------------
// Props

export interface IEntityTemplateProps_Null {
    type: "null",
}

export interface IEntityTemplateProps_Weapon {
    type: "Weapon",
}

export interface IEntityTemplateProps_Shield {
    type: "Shield",
}

export interface IEntityTemplateProps_Armor {
    type: "Armor",
}

export interface IEntityTemplateProps_Accessory {
    type: "Accessory",
}

export interface IEntityTemplateProps_Grass {
    type: "Grass",

    /** FPの回復量 */
    recoverFP: number,
}

export interface IEntityTemplateProps_Food {
    type: "Food",
}

export interface IEntityTemplateProps_Storage {
    type: "Storage",
}

export type IEntityTemplateProps = 
    IEntityTemplateProps_Null |
    IEntityTemplateProps_Weapon |
    IEntityTemplateProps_Shield |
    IEntityTemplateProps_Accessory |
    IEntityTemplateProps_Armor |
    IEntityTemplateProps_Grass |
    IEntityTemplateProps_Food |
    IEntityTemplateProps_Storage;
