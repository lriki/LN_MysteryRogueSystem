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
    /** RE-Key */
    key: string;

    kindId: DEntityKindId;
    behaviors: DBehaviorInstantiation[];
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

    meta_prefabName: string;
}

export interface DBehaviorInstantiation {
    name: string;
    args: any[];
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
        prefabId: 0,
        meta_prefabName: "",
    }
}

export function parseMetaToEntityProperties(meta: any | undefined): DEntityProperties {
    if (meta) {
        const kindName = meta["RE-Kind"];
        const kind = kindName ? REData.findEntityKind(kindName) : undefined;
        const data: DEntityProperties = {
            key: meta["RE-Key"] ?? "",
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
            prefabId: 0,
            meta_prefabName: meta["RE-Prefab"]
        };

        const behaviors = meta["RE-Behavior"];
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

