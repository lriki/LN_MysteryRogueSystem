import { REGame } from "./REGame";
import { RE_Game_Entity } from "./REGame_Entity";

/**
 */
export class REVisual_Manager
{


    visualRunning(): boolean {
        return false;
    }

    update(): void {
    }

    constructor() {
        REGame.map.signalEntityEntered = this.handlleEntityEnteredMap;
        REGame.map.signalEntityLeaved = this.handlleEntityLeavedMap;
    }

    _finalize() {
        REGame.map.signalEntityEntered = undefined;
        REGame.map.signalEntityLeaved = undefined;
    }

    private handlleEntityEnteredMap(entity: RE_Game_Entity) {

    }

    private handlleEntityLeavedMap(entity: RE_Game_Entity) {

    }
}

