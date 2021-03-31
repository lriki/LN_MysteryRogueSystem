
export type DTemplateMapId = number;

export interface DTemplateMap {
    id: DTemplateMapId;
    name: string;
}

export function DTemplateMap_Default(): DTemplateMap {
    return {
        id: 0,
        name: "null",
    };
}
