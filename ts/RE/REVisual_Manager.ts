import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";
import { REVisual_Entity } from "./REVisual_Entity";

/**
 */
export class REVisual_Manager
{
    private _visualEntities: REVisual_Entity[] = [];


    visualRunning(): boolean {
        return false;
    }

    update(): void {
        this._visualEntities.forEach(x => {
            x._update();
        });
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
        const visual = new REVisual_Entity(entity);
        this._visualEntities.push(visual);
    }

    private handlleEntityLeavedMap(entity: REGame_Entity) {
        const index = this._visualEntities.findIndex(x => x.entity() == entity);
        if (index >= 0) {
            this._visualEntities.splice(index, 1);
        }
    }
}

