import { LBattlerBehavior } from "./objects/behaviors/LBattlerBehavior";
import { REGame } from "./objects/REGame";
import { SDebugHelpers } from "./system/SDebugHelpers";


function setHP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
}


function aaaafunc() {
    console.log("invoked foobar!");
}



(window as any).re = {
    aaaa: aaaafunc,
    setHP: setHP,
};

export {}
