import { DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { LEntity } from "ts/objects/LEntity";
import { LState } from "ts/objects/states/LState";
import { SCommandContext } from "ts/system/SCommandContext";

export class UState {

    public static doAddStateAndResolveStates(context: SCommandContext, entity: LEntity, stateIds: DStateId[]): void {
        const affectedStates = entity.states();

        const removeStates: boolean[] = new Array(affectedStates.length);
        for (const stateId of stateIds) {
            const state = REData.states[stateId];
            for (const stateGroupId of state.stateGroupIds) {
                const stateGroup = REData.stateGroups[stateGroupId];
                if (stateGroup.exclusive) {
                    
                    for (let i = 0; i < affectedStates.length; i++) {
                        const affectedState = affectedStates[i];
                        const stateData = affectedState.stateData();
                        if (stateData.id != stateId &&  // 既に同じ State が適用されているときは除外しない
                            affectedState.stateData().stateGroupIds.includes(stateGroup.id)) {
                            removeStates[i] = true;
                        }
                    }
                }
            }
        }

        for (let i = 0; i < removeStates.length; i++) {
            if (removeStates[i]) {
                entity.removeState(affectedStates[i].stateDataId());
            }
        }

        for (const stateId of stateIds) {
            entity.addState(stateId);
        }
    }

    public static doResolveStatesFromParamChanged(): void {

    }

}
