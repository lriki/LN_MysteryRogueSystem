import { DPrefabId } from "./DPrefab";



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
    behaviorNames: string[];
    commandNames: string[];
    reactionNames: string[];
    abilityNames: string[];
    capacity?: string;
    
    equipmentImage: DItemEquipmentImage;

    /**
     * プレハブID
     * 
     * 例えば固定お店の処理において、アイテムのリストはツクールのイベントからアイテムIDで指定される。（プレハブIDではない）
     * このアイテムIDをインスタンス化するときにプレハブIDが必要になるため、アイテムデータはプレハブIDを知っている必要がある。
     */
    prefabId: DPrefabId;
}

export function DEntityProperties_Default(): DEntityProperties {
    return {
        key: "",
        kind: "",
        behaviorNames: [],
        commandNames: [],
        reactionNames: [],
        abilityNames: [],
        capacity: undefined,
        equipmentImage: {
            name: "",
            side: DItemEquipmentSide.Right,
        },
        prefabId: 0,
    }
}

export function parseMetaToEntityProperties(meta: any | undefined): DEntityProperties {
    if (meta) {
        const data: DEntityProperties = {
            key: meta["RE-Key"],
            kind: meta["RE-Kind"],
            behaviorNames: [],
            commandNames: [],
            reactionNames: [],
            abilityNames: [],
            capacity: meta["RE-Capacity"],
            equipmentImage: {
                name: "",
                side: DItemEquipmentSide.Right,
            },
            prefabId: 0,
        };

        const behaviors = meta["RE-Behavior"];
        if (behaviors) {
            data.behaviorNames = (behaviors as string).split(";");
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
