
export interface DEntityProperties {
    /** RE-Key */
    key: string;

    kind: string;
    behaviors: string[];
    commands: string[];
    reactions: string[];
    abilities: string[];
    capacity?: string;
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

        return data;
    }
    else {
        return DEntityProperties_Default();
    }
}
