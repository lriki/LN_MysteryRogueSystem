import { assert } from "ts/Common";
import { DHelpers } from "./DHelper";
import { DPrefabId } from "./DPrefab";
import { DStateId } from "./DState";
import { REData } from "./REData";


export interface DEntity {
    prefabId: DPrefabId;
    stateIds: DStateId[];
}

export function DEntity_Default(): DEntity {
    return {
        prefabId: 0,
        stateIds: [],
    };
}

export function DEntity_makeFromEventData(event: IDataMapEvent): DEntity | undefined {
    return DEntity_makeFromEventPageData(event.id, event.pages[0]);
}

export function DEntity_makeFromEventPageData(eventId: number, page: IDataMapEventPage): DEntity | undefined {
    const entityMetadata = DHelpers.readEntityMetadataFromPage(page, eventId);
    if (!entityMetadata) return undefined;
    
    const entity: DEntity = {
        prefabId: REData.prefabs.findIndex(p => p.key == entityMetadata.prefab),
        stateIds: [],
    };

    for (const stateKey of entityMetadata.states) {
        const index = REData.states.findIndex(s => s.key == stateKey);
        if (index > 0) {
            entity.stateIds.push(index);
        }
        else {
            throw new Error(`State "${stateKey}" not found.`);
        }
    }

    return entity;
}

