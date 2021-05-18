import { LBattlerBehavior } from "./objects/behaviors/LBattlerBehavior";
import { LEntity } from "./objects/LEntity";
import { REGame } from "./objects/REGame";
import { SDebugHelpers } from "./system/SDebugHelpers";


function setHP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
}

function setFP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setFP(e, value);
}

function entities(domain?: string): LEntity[] {
    if (domain == "world") {
        //return REGame.world.entities();
        throw new Error("Not implemented.");
    }
    else {
        return REGame.map.entities();
    }
}





(window as any).re = {
    setHP: setHP,
    setFP: setFP,
    entities: entities,

};

export {}
