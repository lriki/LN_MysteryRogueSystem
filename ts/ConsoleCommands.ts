import { LBattlerBehavior } from "./objects/behaviors/LBattlerBehavior";
import { LEntity } from "./objects/LEntity";
import { REGame } from "./objects/REGame";
import { SDebugHelpers } from "./system/SDebugHelpers";


function setHP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
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


function aaaafunc() {
    console.log("invoked foobar!");
}



(window as any).re = {
    aaaa: aaaafunc,
    setHP: setHP,
    entities: entities,

};

export {}
