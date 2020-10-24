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

        // init 時点の map 上にいる Entity から Visual を作る
        REGame.map.entities().forEach(x => {
            this.createVisual(x);
        });
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
        this.createVisual(entity);
    }

    private handlleEntityLeavedMap(entity: REGame_Entity) {
        const index = this._visualEntities.findIndex(x => x.entity() == entity);
        if (index >= 0) {
            this._visualEntities.splice(index, 1);
        }
    }

    private createVisual(entity: REGame_Entity) {
        const event = $gameMap.spawnREEvent();
        const visual = new REVisual_Entity(entity, event.rmmzEventId());
        this._visualEntities.push(visual);
    }
}

