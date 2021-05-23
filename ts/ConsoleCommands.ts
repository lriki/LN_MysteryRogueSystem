import { REData } from "./data/REData";
import { LBattlerBehavior } from "./objects/behaviors/LBattlerBehavior";
import { LEntity } from "./objects/LEntity";
import { REGame } from "./objects/REGame";
import { SDebugHelpers } from "./system/SDebugHelpers";


function entities(domain?: string): LEntity[] {
    if (domain == "world") {
        //return REGame.world.entities();
        throw new Error("Not implemented.");
    }
    else {
        return REGame.map.entities();
    }
}


function setHP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
}

function setFP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setFP(e, value);
}

/**
 * 
 * @param entityId 
 * @param pattern id, name, key
 */
function addState(entityId: number, pattern: string) {
    const e = REGame.world.entityByIndex(entityId);
    e.addState(REData.getStateFuzzy(pattern).id);
}




(window as any).re = {
    entities: entities,
    setHP: setHP,
    setFP: setFP,
    addState: addState,

};

export {}
