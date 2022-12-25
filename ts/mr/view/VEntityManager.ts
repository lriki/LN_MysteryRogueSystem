import { MRDataManager } from "ts/mr/data/MRDataManager";
import { MRLively } from "ts/mr/lively/MRLively";
import { LEntity } from "ts/mr/lively/LEntity";
import { SSequelSet } from "ts/mr/system/SSequel";
import { VSequelManager } from "./VSequelManager";
import { VEntity } from "./VEntity";
import { assert } from "ts/mr/Common";
import { SRmmzHelpers } from "../system/SRmmzHelpers";
import { MRData } from "../data/MRData";


/**
 * EntityVisual の管理クラス。
 * 
 * Spriteset_Map と同じように、Scene_Map の生成・破棄に合わせて Sprite の表示状態を制御する。
 * 実際にこのクラスが Sprite を生成するものではない点に注意。
 * 
 * なお、Spriteset_Map は SceneManager.onBeforeSceneStart() からの Scene(PIXI.Stage) の destory により破棄される。
 */
export class VEntityManager {
    private _visualEntities: VEntity[];
    private _sequelManager: VSequelManager;
    //private _reservedDeleteVisuals: REVisual_Entity[];

    constructor() {
        this._visualEntities = [];
        this._sequelManager = new VSequelManager(this);
        //this._reservedDeleteVisuals = [];
        MRLively.signalFlushSequelSet = (x) => this.handleFlushSequelSet(x);
        
        // init 時点の map 上にいる Entity から Visual を作る
        if (MRLively.mapView.currentFloorId.isTacticsMap2) {
            this.resetVisuals();
        }
    }

    public resetVisuals(): void {
        for (const visual of this._visualEntities) {
            this.detachVisual(visual);
        }
        this._visualEntities = [];

        MRLively.mapView.currentMap.entities().forEach(x => {
            this.createVisual2(x);
        });
    }

    public entityVisuals(): VEntity[] {
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

    public sequelManager(): VSequelManager {
        return this._sequelManager;
    }

    public findEntityVisualByEntity(entity: LEntity): VEntity | undefined {
        return this._visualEntities.find(x => x.entity().entityId() == entity.entityId());
    }

    public getEntityVisualByEntity(entity: LEntity): VEntity {
        const v = this.findEntityVisualByEntity(entity);
        assert(v);
        return v;
    }

    findEntityVisualByRMMZEventId(rmmzEventId: number): VEntity | undefined {
        return this._visualEntities.find(x => x.rmmzEventId() == rmmzEventId);
    }

    visualRunning(): boolean {
        return this._sequelManager.isRunning;
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

    private detachVisual(visual: VEntity): void {
        this._sequelManager.removeVisual(visual);
        $gameMap.event(visual.rmmzEventId()).erase();
    }

    private handleFlushSequelSet(sequelSet: SSequelSet) {
        this._sequelManager.setup(sequelSet);
    }
    

    public createVisual2(entity: LEntity): void {
        console.log("createVisual2", entity);

        let overrideEvent: IDataMapEvent | undefined;
        const floorNumber = MRLively.mapView.currentMap.floorId().floorNumber;
        const land = MRLively.mapView.currentMap.land2();
        for (const info of land.landData().appearanceTable.entities) {
            if (info.startFloorNumber <= floorNumber && floorNumber <= info.lastFloorNumber) {
                if (info.spawiInfo.entityId == entity.dataId) {
                    overrideEvent = info.spawiInfo.overrideEvent;
                }
            }
        }

        const prefabId = entity.getPrefabId();
        const prefab = MRData.prefabs[prefabId];

        if (entity.inhabitsCurrentFloor) {
            // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
            // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            assert(entity.rmmzEventId > 0);
            $gameMap.spawnREEvent(prefab, entity.rmmzEventId, undefined);
        }
        else {
            //assert(entity.rmmzEventId == 0);
            if (entity.rmmzEventId > 0 && $gameMap.event(entity.rmmzEventId)) {
                // セーブデータのロード後はここに来る。
                // Visual 用に作った Event もセーブデータに含まれているため。
                // ちょっと不自然な動作な気がするけど、対策するならまずオートセーブのタイミングを考え直さないとならない。
                // ただオートセーブのタイミングは RMMZ の都合で決められているので、それを曲げるのはやめたほうがいいかも。
                // 他プラグインとの競合も心配。
                assert($gameMap.event(entity.rmmzEventId));
            }
            else {
                //  entity に対応する動的イベントを新たに生成する
                const event = $gameMap.spawnREEvent(prefab, undefined, overrideEvent);
                entity.setRmmzEventId(event.eventId());
            }
        }

        this.createVisual(entity);
    }

    private createVisual(entity: LEntity) {
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
        }

        if (!event) {
            throw new Error();
        }

        assert(event.isREEvent());

        const visual = new VEntity(entity, event.eventId());
        //event._visualId = this._visualEntities.length;
        this._visualEntities.push(visual);
    }
}

