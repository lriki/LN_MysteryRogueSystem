import { REData } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { REGame } from "ts/RE/REGame";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESequelSet } from "ts/RE/REGame_Sequel";
import { REVisualSequelManager } from "./REVisualSequelManager";
import { REVisual_Entity } from "./REVisual_Entity";


/**
 * EntityVisual の管理クラス。
 * 
 * Spriteset_Map と同じように、Scene_Map の生成・破棄に合わせて Sprite の表示状態を制御する。
 * 実際にこのクラスが Sprite を生成するものではない点に注意。
 * 
 * なお、Spriteset_Map は SceneManager.onBeforeSceneStart() からの Scene(PIXI.Stage) の destory により破棄される。
 */
export class REEntityVisualSet {
    private _visualEntities: REVisual_Entity[];
    private _sequelManager: REVisualSequelManager;

    constructor() {
        this._visualEntities = [];
        this._sequelManager = new REVisualSequelManager(this);
        REGame.map.signalEntityEntered = (x) => this.handlleEntityEnteredMap(x);
        REGame.map.signalEntityLeaved = (x) => this.handlleEntityLeavedMap(x);
        REGame.scheduler.signalFlushSequelSet = (x) => this.handleFlushSequelSet(x);
        
        // init 時点の map 上にいる Entity から Visual を作る
        REGame.map.entities().forEach(x => {
            this.createVisual(x);
        });
    }

    ternimate() {
        this._visualEntities = [];
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

    findEntityVisualByEntity(entity: REGame_Entity): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.entity().id() == entity.id());
    }

    findEntityVisualByRMMZEventId(rmmzEventId: number): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.rmmzEventId() == rmmzEventId);
    }

    visualRunning(): boolean {
        return this._sequelManager.isRunning();
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

    private handleFlushSequelSet(sequelSet: RESequelSet) {
        this._sequelManager.setup(sequelSet);
    }
    
    private createVisual(entity: REGame_Entity) {
        const databaseMap = REDataManager.databaseMap();
        if (!databaseMap || !databaseMap.events) {
            throw new Error();
        }

        let event: Game_Event;
        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            const prefabKey = `${REData.entityKinds[entity.prefabKey.kind].prefabKind}:${entity.prefabKey.id}`;
            const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabKey : false);
            if (index >= 0) {
                const eventData = databaseMap.events[index];
                event = $gameMap.spawnREEvent(eventData);
            }
            else {
                throw new Error(`${prefabKey} not found in REDatabase map.`);
            }
        }
        else if (entity.prefabKey.kind == 0 && entity.prefabKey.id > 0) {
            // 固定マップ用。現在マップに出現しているイベントから作る
            event = $gameMap.event(entity.prefabKey.id);
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


        const visual = new REVisual_Entity(entity, event.eventId());
        this._visualEntities.push(visual);
    }
}

