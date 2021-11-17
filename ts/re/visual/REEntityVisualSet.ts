import { REDataManager } from "ts/re/data/REDataManager";
import { REGame } from "ts/re/objects/REGame";
import { LEntity } from "ts/re/objects/LEntity";
import { SSequelSet } from "ts/re/system/SSequel";
import { REVisualSequelManager } from "./REVisualSequelManager";
import { REVisual_Entity } from "./REVisual_Entity";
import { assert } from "ts/re/Common";


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
    //private _reservedDeleteVisuals: REVisual_Entity[];

    constructor() {
        this._visualEntities = [];
        this._sequelManager = new REVisualSequelManager(this);
        //this._reservedDeleteVisuals = [];
        REGame.signalFlushSequelSet = (x) => this.handleFlushSequelSet(x);
        
        // init 時点の map 上にいる Entity から Visual を作る
        REGame.map.entities().forEach(x => {
            this.createVisual(x);
        });
    }

    public entityVisuals(): REVisual_Entity[] {
        return this._visualEntities;
    }

    ternimate() {
        this._visualEntities = [];
    }
    
    update(): void {
        this._sequelManager.update();
        //this._sequelManager.postUpdate();

        this._visualEntities.forEach(x => {
            x._update();
        });

        //this._sequelManager.update();
        this._sequelManager.postUpdate();

        this.deleteVisuals();
    }

    public sequelManager(): REVisualSequelManager {
        return this._sequelManager;
    }

    public findEntityVisualByEntity(entity: LEntity): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.entity().entityId() == entity.entityId());
    }

    public getEntityVisualByEntity(entity: LEntity): REVisual_Entity {
        const v = this.findEntityVisualByEntity(entity);
        assert(v);
        return v;
    }

    findEntityVisualByRMMZEventId(rmmzEventId: number): REVisual_Entity | undefined {
        return this._visualEntities.find(x => x.rmmzEventId() == rmmzEventId);
    }

    visualRunning(): boolean {
        return this._sequelManager.isRunning();
    }

    public reserveDeleteVisual(entity: LEntity): void {
        const index = this._visualEntities.findIndex(x => x.entity() == entity);
        if (index >= 0) {
            const visual = this._visualEntities[index];
            visual.reservedDestroy = true;
            console.log("reserveDeleteVisual!!!!!!!!!!", visual.rmmzEventId());
        }
    }

    private deleteVisuals() {
        if (this._sequelManager.isRunning()) return;


        for (let i = this._visualEntities.length - 1; i >= 0; i--) {
            const visual = this._visualEntities[i];
            if (visual.reservedDestroy) {
                this._sequelManager.removeVisual(visual);
            
                $gameMap.event(visual.rmmzEventId()).erase();

                
                // NOTE: このメソッドはマップ遷移時の全開放時もよばれるが、
                // そのときはマップ遷移後に Spriteset_Map が新しいインスタンスで new されるため、
                // ↑の erase() の意味もあまりないが、影響はないため現状とする。
        
                this._visualEntities.splice(i, 1);
                console.log("delete!!!!!!!!!!");
            }
        }
    }

    private handleFlushSequelSet(sequelSet: SSequelSet) {
        this._sequelManager.setup(sequelSet);
    }
    
    createVisual(entity: LEntity) {
        const databaseMap = REDataManager.databaseMap();
        if (!databaseMap || !databaseMap.events) {
            throw new Error();
        }

        let event: Game_Event | undefined = undefined;
        if (entity.rmmzEventId > 0) {
            event = $gameMap.event(entity.rmmzEventId);
        }
        //else if (entity.prefabKey.kind == 0 && entity.prefabKey.id > 0) {
            // 固定マップ用。現在マップに出現しているイベントから作る
        //    event = $gameMap.event(entity.prefabKey.id);
        //}
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

        if (!event) {
            throw new Error();
        }

        console.log("event", event);
        console.log("event.isREEvent()", event.isREEvent());
        assert(event.isREEvent());


        const visual = new REVisual_Entity(entity, event.eventId());
        //event._visualId = this._visualEntities.length;
        this._visualEntities.push(visual);
    }
}

