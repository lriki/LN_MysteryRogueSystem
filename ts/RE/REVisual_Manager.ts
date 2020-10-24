import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";
import { REVisual_Entity } from "./REVisual_Entity";

/**
 */
export class REVisual_Manager
{
    private _visualEntities: REVisual_Entity[] = [];
    
    constructor() {
        REGame.map.signalEntityEntered = this.handlleEntityEnteredMap;
        REGame.map.signalEntityLeaved = this.handlleEntityLeavedMap;
    }

    findEntityVisualByRMMZEventId(rmmzEventId: number): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.rmmzEventId() == rmmzEventId);
    }

    visualRunning(): boolean {
        return false;
    }

    update(): void {
        this._visualEntities.forEach(x => {
            x._update();
        });
    }

    _finalize() {
        REGame.map.signalEntityEntered = undefined;
        REGame.map.signalEntityLeaved = undefined;
    }

    private handlleEntityEnteredMap(entity: REGame_Entity) {
        //const visual = new REVisual_Entity(entity);
        //this._visualEntities.push(visual);
    }

    private handlleEntityLeavedMap(entity: REGame_Entity) {
        const index = this._visualEntities.findIndex(x => x.entity() == entity);
        if (index >= 0) {
            this._visualEntities.splice(index, 1);
        }
    }
}

