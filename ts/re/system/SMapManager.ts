import { REGame } from "ts/re/objects/REGame";
import { LEntity } from "ts/re/objects/LEntity";
import { RESystem } from "./RESystem";
import { LMap } from "ts/re/objects/LMap";
import { SEntityFactory } from "./internal";
import { assert, Log } from "ts/re/Common";
import { FMap } from "ts/re/floorgen/FMapData";
import { REData } from "ts/re/data/REData";
import { LObjectType } from "ts/re/objects/LObject";
import { LBlock } from "ts/re/objects/LBlock";
import { UMovement } from "../usecases/UMovement";
import { SMonsterHouseBuilder } from "./map/SMonsterHouseBuilder";
import { LMonsterHouseStructure } from "ts/re/objects/structures/LMonsterHouseStructure";
import { LRandom } from "ts/re/objects/LRandom";
import { LItemShopStructure } from "ts/re/objects/structures/LItemShopStructure";
import { SItemShopBuilder } from "./map/SItemShopBuilder";
import { USearch } from "../usecases/USearch";
import { DBlockLayerKind } from "../data/DCommon";
import { USpawner } from "../usecases/USpawner";
import { ULimitations } from "../usecases/ULimitations";
import { paramMaxTrapsInMap } from "../PluginParameters";
import { DEntityKind } from "../data/DEntityKind";
import { UEffect } from "../usecases/UEffect";
import { DAppearanceTableEntity } from "../data/DLand";


/**
 * LMap へのアイテムや敵の生成・配置など、ゲーム進行に伴う Map 上の変化を管理するクラス。
 */
export class SMapManager {
    private _map: LMap;
    private _enemySpanwRate: number = 10;
    private _enemySpawnCount: number = 0;   // TODO: これは Ojbect 側に持って行かないとまずいかも
    private _needRefreshVisual: boolean = false;

    constructor() {
        this._map = REGame.map;
        this._enemySpawnCount = this._enemySpanwRate;
    }

    public setMap(map: LMap): void {
        this._map = map;
    }

    public map(): LMap {
        return this._map;
    }

    public rand(): LRandom {
        return REGame.world.random();
    }

    public setupMap(initialMap: FMap): void {
        const newFloorId = this._map.floorId();

        if (newFloorId.isNormalMap()) {
            
        }
        else if (newFloorId.isRandomMap()) {
            this.setupRandomMap(initialMap);
        }
        else {
            this.setupFixedMap(initialMap);
        }
    }

    private setupRandomMap(initialMap: FMap): void {
        const floorId = this._map.floorId();

        this.requestRefreshVisual();

        // 階段を配置する
                // TODO: お店の外
        {
            const exitPoint = initialMap.exitPont();
            if (exitPoint) {
                const appearanceTable = REData.lands[floorId.landId()].appearanceTable;
                const prefab = appearanceTable.system[floorId.floorNumber()].find(e => {
                    return DEntityKind.isExitPoint(e.spawiInfo.entityData());
                });
                assert(prefab);


                const entity = SEntityFactory.newBasicExitPoint();
                
                REGame.world._transferEntity(entity, floorId, exitPoint.mx(), exitPoint.my());
            }
        }
        
        const enterdEntities = this.enterEntitiesToCurrentMap();

        this.buildStructurs();

        // この Floor にいるべき Entity を配置する
        {
            
            //const objects = REGame.world.objects();
            for (const entity of enterdEntities) {
                if (entity.floorId.equals(this._map.floorId())) {

                    const layer = entity.getHomeLayer();
                    const block = this.findSpawnableBlockRandom(layer);
                    assert(block);
                    
                    UMovement.locateEntity(entity, block.mx, block.my);
                }
            }
        }

        // Enemy 初期生成
        const enemyCount = 5;
        for (let i = 0; i < enemyCount; i++) {
            const candidateBlocks = this._map.getSpawnableBlocks(DBlockLayerKind.Unit);
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[this.rand().nextIntWithMax(candidateBlocks.length)];
                this.spawnEnemy(block.mx, block.my);
            }
        }

        // Item 初期生成
        const itemCount = 5;
        for (let i = 0; i < itemCount; i++) {
            const candidateBlocks = this._map.getSpawnableBlocks(DBlockLayerKind.Ground);
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[this.rand().nextIntWithMax(candidateBlocks.length)];
                this.spawnItem(block.mx, block.my);
            }
        }

        // Trap 初期生成
        const trapCount = 5;
        this.spawnTraps(trapCount);

        // Event 配置
        const eventTable = this._map.land2().landData().appearanceTable.events[floorId.floorNumber()];
        for (const i of eventTable) {
            RESystem.integration.onLocateRmmzEvent(i.rmmzEventId, 0, 0);
        }
    }

    private setupFixedMap(initialMap: FMap): void {
        RESystem.integration.onLoadFixedMapEvents();

        this.buildStructurs();

        const enterdEntities = this.enterEntitiesToCurrentMap();

        const entryPoint = initialMap.entryPoint();
        assert(entryPoint);
        for (const entity of enterdEntities) {
            if (entity.isOnOffstage()) {

                // TODO: 複数 Entity が重なるときの対策

                UMovement.locateEntity(entity, entryPoint.mx(), entryPoint.my());
            }
        }
    }

    public setupInitial(): void {

    }

    public buildStructurs(): void {
        // モンスターハウス
        for (const s of this._map.structures()) {
            if (s.id() == 0) {
                // dummy
            }
            else if (s instanceof LMonsterHouseStructure) {
                const builder = new SMonsterHouseBuilder();
                builder.build(this, s, this.rand());
            }
            else if (s instanceof LItemShopStructure) {
                console.log("ItemShop!!");
                const builder = new SItemShopBuilder();
                builder.build(this, s, this.rand());
            }
            else {
                throw new Error("Not implemented.");
            }
        }
    }

    public requestRefreshVisual(): void {
        this._needRefreshVisual = true;
    }

    public attemptRefreshVisual(): void {
        if (this._needRefreshVisual) {
            if (this._map.floorId().isRandomMap()) {
                RESystem.integration.refreshGameMap(REGame.map);
            }
            else {
                // 固定マップの場合は RMMZ 側で既に準備済みなので更新不要
            }
            
            this._needRefreshVisual = false;
        }
    }

    public updateRound(): void {
        this._enemySpawnCount--;
        
        if (this._enemySpawnCount <= 0) {
            this._enemySpawnCount = this._enemySpanwRate;
            this.spawnRandomEnemy();
        }
    }

    // 現在の Map(Floor) に存在するべき Entity を、Map に登場 (追加) させる
    // ※追加だけ。配置方法はマップの種類によって変わるので、この関数では行わない。
    private enterEntitiesToCurrentMap(): LEntity[] {
        const player = REGame.camera.focusedEntity();
        assert(player)

        const result: LEntity[] = [];
        const isFixedMap = this._map.floorId().isFixedMap();

        const objects = REGame.world.objects();
        for (let i = 1; i < objects.length; i++) {
            const obj = objects[i];
            if (obj && obj.objectType() == LObjectType.Entity) {
                const entity = obj as LEntity;
                // enterEntitiesToCurrentMap() が呼ばれる前に Map の setup が行われている。
                // 固定マップの場合は既にいくつか Entity が追加されていることがあるので、
                // それはここでは追加しない。
                const isEnterd = entity.hasParent();

                // onLoadFixedMapEvents() によって既に追加されているものは対象外
                if (entity.isAppearedOnMap()) continue;

                if (this._map.floorId().equals(entity.floorId) && !isEnterd) {
                    //if (isFixedMap) {
                        this._map._reappearEntity(entity);
                        result.push(entity);
                    //}
                    /*
                    else {
                        const layer = entity.queryProperty(RESystem.properties.homeLayer);
                        const block = this.findSpawnableBlockRandom(entity, layer);
                        assert(block);
                        
                        
                        //const block = this.block(entity.x, entity.y);
                        //const layer = entity.queryProperty(RESystem.properties.homeLayer);
                        block.addEntity(layer, entity);
                        this._map._addEntityInternal(entity);
                    }
                    */
                }
            }
        }

        return result;
    }

    private findSpawnableBlockRandom(layer: DBlockLayerKind): LBlock | undefined {
        

        // 
        const spawnableBlocks = this._map.roomFloorBlocks().filter(b => b.isContinuation() && !b.layer(layer).isContainsAnyEntity());
        if (spawnableBlocks.length == 0) return undefined;

        const candidateBlocks = spawnableBlocks;
        if (candidateBlocks.length == 0) return undefined;
        
        return candidateBlocks[this.rand().nextIntWithMax(candidateBlocks.length)];
    }

    private spawnRandomEnemy(): void {
        const block = USearch.selectUnitSpawnableBlock(this.rand());
        if (block) {
            this.spawnEnemy(block.mx, block.my);
        }
        else {
            throw new Error("Not implemented.");
        }
    }

    /** 出現テーブルからランダムに選択して Entity を作る */
    public spawnEnemy(mx: number, my: number): LEntity[] {
        const floorId = this._map.floorId();
        const table = this._map.land2().landData().appearanceTable;
        if (table.enemies.length == 0) return [];    // 出現テーブルが空
        const list = table.enemies[floorId.floorNumber()];
        if (list.length == 0) return [];    // 出現テーブルが空

        const data = UEffect.selectRatingForce<DAppearanceTableEntity>(this.rand(), list, x => x.spawiInfo.rate);
        let entites: LEntity[];
        if (data.spawiInfo.troopId > 0) {
            entites = SEntityFactory.spawnTroopAndMembers( REData.troops[data.spawiInfo.troopId], mx, my, data.spawiInfo.stateIds);
        }
        else {
            const entity = SEntityFactory.newEntity(data.spawiInfo, floorId);
            REGame.world._transferEntity(entity, floorId, mx, my);
            entites = [entity];
        }

        // 向きをランダムに決定
        const dir = this.rand().select(UMovement.directions);
        for (const e of entites) {
            e.dir = dir;
        }

        return entites;
    }

    /** 出現テーブルからランダムに選択して Item を作る */
    public spawnItem(mx: number, my: number): LEntity | undefined {
        const floorId = this._map.floorId();
        const entity = USpawner.createItemFromSpawnTable(floorId, this.rand());
        if (entity) {
            REGame.world._transferEntity(entity, floorId, mx, my);
        }
        return entity;
    }

    /** 出現テーブルからランダムに選択して Trap を作る */
    public spawnTrap(mx: number, my: number): void {
        const floorId = this._map.floorId();
        const entity = USpawner.createTrapFromSpawnTable(floorId, this.rand());
        if (entity) {
            REGame.world._transferEntity(entity, floorId, mx, my);
        }
    }

    public spawnTraps(count: number): void {
        const remain = paramMaxTrapsInMap - ULimitations.getTrapCountInMap();
        const actualCount = Math.min(count, remain);
        const candidateBlocks = this._map.getSpawnableBlocks(DBlockLayerKind.Ground);
        for (let i = 0; i < actualCount; i++) {
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[this.rand().nextIntWithMax(candidateBlocks.length)];
                const entity = this.spawnTrap(block.mx, block.my);
                candidateBlocks.mutableRemove(x => x == block);
            }
        }
    }
}

