import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";

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

    private handlleEntityEnteredMap(entity: REGame_Entity) {

    }

    private handlleEntityLeavedMap(entity: REGame_Entity) {

    }
}

