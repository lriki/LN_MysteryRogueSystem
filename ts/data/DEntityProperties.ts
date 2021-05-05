


export enum DItemEquipmentSide {
    Right,
    Left,
}

export interface DItemEquipmentImage {
    name: string;
    side: DItemEquipmentSide;
}

export interface DEntityProperties {
    /** RE-Key */
    key: string;

    kind: string;
    behaviors: string[];
    commands: string[];
    reactions: string[];
    abilities: string[];
    capacity?: string;
    
    equipmentImage: DItemEquipmentImage;
}

export function DEntityProperties_Default(): DEntityProperties {
    return {
        key: "",
        kind: "",
        behaviors: [],
        commands: [],
        reactions: [],
        abilities: [],
        capacity: undefined,
        equipmentImage: {
            name: "",
            side: DItemEquipmentSide.Right,
        }
    }
}

export function parseMetaToEntityProperties(meta: any | undefined): DEntityProperties {
    if (meta) {
        const data: DEntityProperties = {
            key: meta["RE-Key"],
            kind: meta["RE-Kind"],
            behaviors: [],
            commands: [],
            reactions: [],
            abilities: [],
            capacity: meta["RE-Capacity"],
            equipmentImage: {
                name: "",
                side: DItemEquipmentSide.Right,
            }
        };

        const behaviors = meta["RE-Behavior"];
        if (behaviors) {
            data.behaviors = (behaviors as string).split(";");
        }

        const commands = meta["RE-Command"];
        if (commands) {
            data.commands = (commands as string).split(";");
        }

        const reactions = meta["RE-Reaction"];
        if (reactions) {
            data.reactions = (reactions as string).split(";");
        }

        const abilities = meta["RE-Ability"];
        if (abilities) {
            data.abilities = (abilities as string).split(";");
        }

        const equipmentImage = meta["RE-EquipmentImage"];
        if (equipmentImage) {
            const tokens = (equipmentImage as string).split(",");
            data.equipmentImage.name = tokens[0];
            switch (tokens[1].toLocaleLowerCase()) {
                case "right":
                    data.equipmentImage.side = DItemEquipmentSide.Right;
                    break;
                case "left":
                    data.equipmentImage.side = DItemEquipmentSide.Left;
                    break;
                default:
                    throw new Error(`Invalid token. (${tokens[1]})`);
            }
        }

        return data;
    }
    else {
        return DEntityProperties_Default();
    }
}
