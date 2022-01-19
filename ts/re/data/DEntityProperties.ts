import { DEntityKindId } from "./DCommon";
import { DHelpers } from "./DHelper";
import { DPrefabId } from "./DPrefab";
import { REData } from "./REData";



export enum DItemEquipmentSide {
    Right,
    Left,
}

export interface DItemEquipmentImage {
    name: string;
    side: DItemEquipmentSide;
}

export interface DEntityProperties {
    /** MR-Key */
    key: string;

    kindId: DEntityKindId;
    behaviors: DBehaviorInstantiation[];
    commandNames: string[];
    reactionNames: string[];
    abilityNames: string[];
    capacity?: string;
    
    equipmentImage: DItemEquipmentImage;

    meta_prefabName: string;
}

export interface DBehaviorInstantiation {
    name: string;
    args?: any[] | undefined;
}

export function DEntityProperties_Default(): DEntityProperties {
    return {
        key: "",
        kindId: 0,
        behaviors: [],
        commandNames: [],
        reactionNames: [],
        abilityNames: [],
        capacity: undefined,
        equipmentImage: {
            name: "",
            side: DItemEquipmentSide.Right,
        },
        meta_prefabName: "",
    }
}

/** @deprecated DMetadataParser */
export function parseMetaToEntityProperties(meta: any | undefined): DEntityProperties {
    if (meta) {
        const kindName = meta["MR-Category"];
        const kind = kindName ? REData.findEntityKind(kindName.trim()) : undefined;
        const data: DEntityProperties = {
            key: (meta["MR-Key"] ?? "").trim(),
            kindId: kind ? kind.id : 0,
            behaviors: [],
            commandNames: [],
            reactionNames: [],
            abilityNames: [],
            capacity: meta["RE-Capacity"],
            equipmentImage: {
                name: "",
                side: DItemEquipmentSide.Right,
            },
            meta_prefabName: (meta["MR-Prefab"] ?? "").trim(),
        };

        const behaviors = meta["MR-Behavior"];
        if (behaviors) {
            if (typeof(behaviors) == "string")
                data.behaviors = parseMetadata_Behavior([behaviors]);
            else
                data.behaviors = parseMetadata_Behavior(behaviors);
        }

        const commands = meta["RE-Command"];
        if (commands) {
            data.commandNames = (commands as string).split(";");
        }

        const reactions = meta["RE-Reaction"];
        if (reactions) {
            data.reactionNames = (reactions as string).split(";");
        }

        const abilities = meta["RE-Ability"];
        if (abilities) {
            data.abilityNames = (abilities as string).split(";");
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

export function parseMetadata_Behavior(meta: string[]): DBehaviorInstantiation[] {
    const result: DBehaviorInstantiation[] = [];
    for (const data of meta) {
        result.push(DHelpers.parseConstructionExpr(data));
    }
    return result;
}

