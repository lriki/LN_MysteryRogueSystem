import { REDataManager } from "ts/re/data/REDataManager";
import { REGame } from "ts/re/objects/REGame";
import { LEntity } from "ts/re/objects/LEntity";
import { SSequelSet } from "ts/re/system/SSequel";
import { REVisualSequelManager } from "./REVisualSequelManager";
import { REVisual_Entity } from "./REVisual_Entity";
import { assert } from "ts/re/Common";
import { SRmmzHelpers } from "../system/SRmmzHelpers";
import { REData } from "../data/REData";


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
        this.resetVisuals();
    }

    public resetVisuals(): void {
        for (const visual of this._visualEntities) {
            this.detachVisual(visual);
        }
        this._visualEntities = [];

        REGame.map.entities().forEach(x => {
            //console.log(x.data().entity.key);
            this.createVisual2(x);
        });
    }

    public entityVisuals(): REVisual_Entity[] {
        return this._visualEntities;
    }

    ternimate() {
        // for (const visual of this._visualEntities) {
        //     const entity = visual.entity();
        //     if (entity.inhabitsCurrentFloor) {
        //     }
        //     else {
        //         const event = $gameMap.event(entity.rmmzEventId);
        //         assert(event);
        //         event.erase();  // 再利用可能にする
        //         entity.rmmzEventId = 0;
        //     }
        // }
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
            
        }
    }

    private deleteVisuals() {
        for (let i = this._visualEntities.length - 1; i >= 0; i--) {
            const visual = this._visualEntities[i];
            if (visual.reservedDestroy) {
                if (visual.sequelContext().isLogicalCompleted2()) {
                    this.detachVisual(visual);
                    
                    // NOTE: このメソッドはマップ遷移時の全開放時もよばれるが、
                    // そのときはマップ遷移後に Spriteset_Map が新しいインスタンスで new されるため、
                    // ↑の erase() の意味もあまりないが、影響はないため現状とする。
            
    
                    this._visualEntities.splice(i, 1);
                }
            }
        }
    }

    private detachVisual(visual: REVisual_Entity): void {
        this._sequelManager.removeVisual(visual);
        $gameMap.event(visual.rmmzEventId()).erase();
    }

    private handleFlushSequelSet(sequelSet: SSequelSet) {
        this._sequelManager.setup(sequelSet);
    }
    

    public createVisual2(entity: LEntity): void {

        // Prefab 検索
        const prefabId = SRmmzHelpers.getPrefabEventDataId(REData.prefabs[entity.data().prefabId].key);

        if (entity.inhabitsCurrentFloor) {
            // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
            // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            assert(entity.rmmzEventId > 0);
            $gameMap.spawnREEvent(prefabId, entity.rmmzEventId);
        }
        else {
            //assert(entity.rmmzEventId == 0);
            if (entity.rmmzEventId > 0) {
                // セーブデータのロード後はここに来る。
                // Visual 用に作った Event もセーブデータに含まれているため。
                // ちょっと不自然な動作な気がするけど、対策するならまずオートセーブのタイミングを考え直さないとならない。
                // ただオートセーブのタイミングは RMMZ の都合で決められているので、それを曲げるのはやめたほうがいいかも。
                // 他プラグインとの競合も心配。
                assert($gameMap.event(entity.rmmzEventId));
            }
            else {
                //  entity に対応する動的イベントを新たに生成する
                const event = $gameMap.spawnREEvent(prefabId);
                entity.rmmzEventId = event.eventId();
            }
        }

        this.createVisual(entity);
    }

    private createVisual(entity: LEntity) {
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

        assert(event.isREEvent());


        const visual = new REVisual_Entity(entity, event.eventId());
        //event._visualId = this._visualEntities.length;
        this._visualEntities.push(visual);
    }
}

