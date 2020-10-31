import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { Vector2 } from "ts/math/Vector2";
import { REDialogVisual } from "ts/visual/REDialogVisual";
import { REManualActionDialogVisual } from "ts/visual/REManualActionDialogVisual";
import { REVisualSequel, REVisualSequel_Move } from "ts/visual/REVisualSequel";
import { REDialogContext } from "../system/REDialog";
import { REGame } from "../RE/REGame";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_Sequel, RESequelSet } from "../RE/REGame_Sequel";
import { REVisual } from "./REVisual";
import { REVisual_Entity } from "./REVisual_Entity";
import { REVisualSequelManager } from "./REVisualSequelManager";
import { REDataManager } from "ts/data/REDataManager";

/**
 */
export class REVisual_Manager
{
    private _visualEntities: REVisual_Entity[] = [];
    //private _dialogVisual: REDialogVisual | null;
    private _tileSize: Vector2 = new Vector2(48, 48);
    private _visualSequelFactory: (() => REVisualSequel)[] = [];
    private _sequelManager: REVisualSequelManager = new REVisualSequelManager(this);
    
    constructor() {
        //this._dialogVisual = null;
        REGame.map.signalEntityEntered = (x) => this.handlleEntityEnteredMap(x);
        REGame.map.signalEntityLeaved = (x) => this.handlleEntityLeavedMap(x);
        REGame.scheduler.signalFlushSequelSet = (x) => this.handleFlushSequelSet(x);

        // init 時点の map 上にいる Entity から Visual を作る
        REGame.map.entities().forEach(x => {
            this.createVisual(x);
        });

        this._visualSequelFactory[REData.MoveSequel] = () => new REVisualSequel_Move();
    }

    tileSize(): Vector2 {
        return this._tileSize;
    }

    findEntityVisualByEntity(entity: REGame_Entity): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.entity().id() == entity.id());
    }

    findEntityVisualByRMMZEventId(rmmzEventId: number): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.rmmzEventId() == rmmzEventId);
    }

    visualRunning(): boolean {
        return this._sequelManager.isRunning();
    }

    perUpdate(): void {
        //if (this._dialogVisual !== null) {
        //    this._dialogVisual.onUpdate(REGame.scheduler._getDialogContext());
        //}
    }

    update(): void {
        this._sequelManager.update();
        this._sequelManager.postUpdate();

        this._visualEntities.forEach(x => {
            x._update();
        });

        this._sequelManager.update();
        this._sequelManager.postUpdate();

    }

    _finalize() {
        REGame.map.signalEntityEntered = undefined;
        REGame.map.signalEntityLeaved = undefined;
    }

    createVisualSequel(sequel: REGame_Sequel): REVisualSequel {
        const factory = this._visualSequelFactory[sequel.sequelId()];
        if (factory) {
            return factory();
        }
        else {
            throw new Error();
        }
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

    handleDialogOpend(context: REDialogContext): REDialogVisual | undefined {
        //assert(!this._dialogVisual);
        const d = context.dialog();
        if (d instanceof REManualActionDialog)
            return new REManualActionDialogVisual();
        // AI 用の Dialog を開いた時など、UI を伴わないものもある
        return undefined;
    }

    handleDialogClosed(context: REDialogContext) {
        //if (this._dialogVisual) {
        //    this._dialogVisual.onClose();
        //    this._dialogVisual = null;
        //}
    }

    private handleFlushSequelSet(sequelSet: RESequelSet) {
        this._sequelManager.setup(sequelSet);
    }

    private createVisual(entity: REGame_Entity) {
        const databaseMap = REDataManager.databaseMap();
        if (!databaseMap || !databaseMap.events) {
            throw new Error();
        }

        
        let eventData: IDataMapEvent;
        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            const prefabKey = `${REData.entityKinds[entity.prefabKey.kind].prefabKind}:${entity.prefabKey.id}`;
            const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabKey : false);
            if (index >= 0) {
                eventData = databaseMap.events[index];
            }
            else {
                throw new Error(`${prefabKey} not found in REDatabase map.`);
            }
        }
        else if (entity.prefabKey.kind == 0 && entity.prefabKey.id > 0) {
            // 固定マップ用。現在マップに出現しているイベントから作る
            if ($dataMap.events) {
                eventData = $dataMap.events[entity.prefabKey.id];
            }
            else {
                throw new Error();
            }
        }
        else {
            // Tile などは Visual を作らない
            return;
            /*
            eventData = {
                id: 0,
                name: "null",
                note: "",
                pages: [
                    {
                        conditions: {
                            actorId: 1,
                            actorValid: false,
                            itemId: 1,
                            itemValid: false,
                            selfSwitchCh: "A",
                            selfSwitchValid: false,
                            switch1Id: 1,
                            switch1Valid: false,
                            switch2Id: 1,
                            switch2Valid: false,
                            variableId: 1,
                            variableValid: false,
                            variableValue: 1,
                        },
                        directionFix: false,
                        image: {
                            tileId: 0,
                            characterName: "",
                            direction: 2,
                            pattern: 0,
                            characterIndex: 1
                        },
                        list: [],
                        moveFrequency: 3,
                        moveRoute: {
                            list: [],
                            repeat: true,
                            skippable: false,
                            wait: false,
                        },
                        moveSpeed: 3,
                        moveType: 0,
                        priorityType: 1,
                        stepAnime: false,
                        through: false,
                        trigger: 0,
                        walkAnime: true,
                    }
                ],
                x: 0,
                y: 0,
            };
            */
        }

        const event = $gameMap.spawnREEvent(eventData);

        const visual = new REVisual_Entity(entity, event.eventId());
        this._visualEntities.push(visual);
    }
}

