import { assert } from "ts/Common";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REDialogVisual } from "ts/visual/REDialogVisual";
import { REManualActionDialogVisual } from "ts/visual/REManualActionDialogVisual";
import { REDialogContext } from "../system/REDialog";
import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";
import { REVisual_Entity } from "./REVisual_Entity";

/**
 */
export class REVisual_Manager
{
    private _visualEntities: REVisual_Entity[] = [];
    private _dialogVisual: REDialogVisual | null;
    
    constructor() {
        this._dialogVisual = null;
        REGame.map.signalEntityEntered = (x) => this.handlleEntityEnteredMap(x);
        REGame.map.signalEntityLeaved = (x) => this.handlleEntityLeavedMap(x);
        REGame.scheduler.signalDialogOpend = (x) => this.handleDialogOpend(x);
        REGame.scheduler.signalDialogClosed = () => this.handleDialogClosed();

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

        if (this._dialogVisual !== null) {
            this._dialogVisual.onUpdate(REGame.scheduler._getDialogContext());
        }
    }

    _finalize() {
        REGame.map.signalEntityEntered = undefined;
        REGame.map.signalEntityLeaved = undefined;
        REGame.scheduler.signalDialogOpend = undefined;
        REGame.scheduler.signalDialogClosed = undefined;
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

    private handleDialogOpend(context: REDialogContext) {
        assert(!this._dialogVisual);
        const d = context.dialog();
        if (d instanceof REManualActionDialog)
            this._dialogVisual = new REManualActionDialogVisual();
        // AI 用の Dialog を開いた時など、UI を伴わないものもある
    }

    private handleDialogClosed() {
        if (this._dialogVisual) {
            this._dialogVisual.onClose();
            this._dialogVisual = null;
        }
    }

    private createVisual(entity: REGame_Entity) {
        const event = $gameMap.spawnREEvent();
        const visual = new REVisual_Entity(entity, event.rmmzEventId());
        this._visualEntities.push(visual);
    }
}

