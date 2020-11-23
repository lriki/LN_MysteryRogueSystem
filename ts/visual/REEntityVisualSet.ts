import { REData } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESequelSet } from "ts/objects/REGame_Sequel";
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

    deleteVisual(entity: REGame_Entity) {
        const index = this._visualEntities.findIndex(x => x.entity() == entity);
        if (index >= 0) {
            const visual = this._visualEntities[index];

            this._sequelManager.removeVisual(visual);
            
            // Game_Event の削除フラグを立てる。
            // 次の Spriteset_Map で、実際に動的 Sprite が削除される。
            $gameMap.event(visual.rmmzEventId()).erase();
            
            // NOTE: このメソッドはマップ遷移時の全開放時もよばれるが、
            // そのときはマップ遷移後に Spriteset_Map が新しいインスタンスで new されるため、
            // ↑の erase() の意味もあまりないが、影響はないため現状とする。

            this._visualEntities.splice(index, 1);

        }
    }

    private handleFlushSequelSet(sequelSet: RESequelSet) {
        this._sequelManager.setup(sequelSet);
    }
    
    createVisual(entity: REGame_Entity) {
        const databaseMap = REDataManager.databaseMap();
        if (!databaseMap || !databaseMap.events) {
            throw new Error();
        }

        let event: Game_Event | undefined = undefined;
        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            event = $gameMap.event(entity.rmmzEventId);
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

        if (!event) {
            throw new Error();
        }


        const visual = new REVisual_Entity(entity, event.eventId());
        this._visualEntities.push(visual);
    }
}

