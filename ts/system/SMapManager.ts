

import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";
import { LMap } from "ts/objects/LMap";
import { SEntityFactory } from "./internal";
import { assert, Log } from "ts/Common";
import { paramEnemySpawnInvalidArea } from "ts/PluginParameters";
import { FMap } from "ts/floorgen/FMapData";
import { REData } from "ts/data/REData";
import { LObjectType } from "ts/objects/LObject";
import { LBlock } from "ts/objects/LBlock";
import { UMovement } from "../usecases/UMovement";
import { BlockLayerKind } from "ts/objects/LBlockLayer";


/**
 * LMap へのアイテムや敵の生成・配置など、ゲーム進行に伴う Map 上の変化を管理するクラス。
 */
export class SMapManager {
    private _map: LMap;
    private _enemySpanwRate: number = 10;
    private _enemySpawnCount: number = 0;   // 

    constructor() {
        this._map = REGame.map;
        this._enemySpawnCount = this._enemySpanwRate;
    }

    public setMap(map: LMap, initialMap: FMap): void {
        this._map = map;
        const newFloorId = map.floorId();

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

        
        RESystem.integration.onRefreshGameMap(REGame.map, initialMap);

        // 階段を配置する
        {
            const exitPoint = initialMap.exitPont();
            if (exitPoint) {
                const appearanceTable = REData.lands[floorId.landId()].appearanceTable;
                const prefab = appearanceTable.system[floorId.floorNumber()].find(e => {
                    return e.spawiInfo.isExitPoint();
                });
                assert(prefab);


                const entity = SEntityFactory.newExitPoint();
                
                console.log("exitPoint prefab", prefab);
                console.log("exitPoint floorId", floorId);
                REGame.world._transferEntity(entity, floorId, exitPoint.mx(), exitPoint.my());
                
                console.log("_transferEntity e");
            }
        }
        
        const enterdEntities = this.enterEntitiesToCurrentMap();

        // この Floor にいるべき Entity を配置する
        {
            
            //const objects = REGame.world.objects();
            for (const entity of enterdEntities) {
            //for (let i = 1; i < objects.length; i++) {
            //    const obj = objects[i];
            //    if (obj && obj.objectType() == LObjectType.Entity) {
                    //const entity = obj as LEntity;
                    if (entity.floorId.equals(this._map.floorId())) {

                        const layer = entity.getHomeLayer();
                        const block = this.findSpawnableBlockRandom(layer);
                        assert(block);
                        
                        UMovement.locateEntity(entity, block.x(), block.y());
                    }
                //}
            }
        }

        // Enemy 初期生成
        const enemyCount = 5;
        for (let i = 0; i < enemyCount; i++) {
            const candidateBlocks = this._map.getSpawnableBlocks(BlockLayerKind.Unit);
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
                this.spawnEnemy(block.x(), block.y());
            }
        }

        // Item 初期生成
        const itemCount = 5;
        for (let i = 0; i < itemCount; i++) {
            const candidateBlocks = this._map.getSpawnableBlocks(BlockLayerKind.Ground);
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
                this.spawnItem(block.x(), block.y());
            }
        }

        // Trap 初期生成
        const trapCount = 5;
        for (let i = 0; i < trapCount; i++) {
            const candidateBlocks = this._map.getSpawnableBlocks(BlockLayerKind.Ground);
            if (candidateBlocks.length > 0) {
                const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
                const entity = this.spawnTrap(block.x(), block.y());
            }
        }

        // Event 配置
        const eventTable = this._map.land2().landData().appearanceTable.events[floorId.floorNumber()];
        for (const i of eventTable) {
            RESystem.integration.onLocateRmmzEvent(i.rmmzEventId, 0, 0);
        }
    }

    private setupFixedMap(initialMap: FMap): void {
        RESystem.integration.onLoadFixedMapEvents();


        const enterdEntities = this.enterEntitiesToCurrentMap();

        const entryPoint = initialMap.entryPoint();
        assert(entryPoint);
        for (const entity of enterdEntities) {
            if (entity.isEnteringToFloor()) {

                // TODO: 複数 Entity が重なるときの対策

                UMovement.locateEntity(entity, entryPoint.mx(), entryPoint.my());
            }
        }
    }

    public setupInitial(): void {

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
                const isNoEnterd = !entity.hasParent();

                // onLoadFixedMapEvents() によって既に追加されているものは対象外
                if (entity.isAppearedOnMap()) continue;

                if (this._map.floorId().equals(entity.floorId) && isNoEnterd) {
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

    private findSpawnableBlockRandom(layer: BlockLayerKind): LBlock | undefined {
        

        // 
        const spawnableBlocks = this._map.roomFloorBlocks().filter(b => b.isContinuation() && !b.layer(layer).isContainsAnyEntity());
        if (spawnableBlocks.length == 0) return undefined;

        const candidateBlocks = spawnableBlocks;
        if (candidateBlocks.length == 0) return undefined;
        
        return candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
    }

    private spawnRandomEnemy(): void {

        // 空いている Block をランダムに選択して配置する
        const spawnableBlocks = this._map.getSpawnableBlocks(BlockLayerKind.Unit);
        assert(spawnableBlocks.length > 0);

        const player = REGame.camera.focusedEntity();
        assert(player);
        const px = player.x;
        const py = player.y;

        const candidateBlocks = spawnableBlocks.filter(b => Math.abs(b.x() - px) > paramEnemySpawnInvalidArea && Math.abs(b.y() - py) > paramEnemySpawnInvalidArea);
        if (candidateBlocks.length > 0) {
            const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
            this.spawnEnemy(block.x(), block.y());
        }
        else {
            // 非常に小さい単一の部屋しかなかったようなケース
        }
    }

    /** 出現テーブルからランダムに選択して Entity を作る */
    private spawnEnemy(mx: number, my: number): void {
        const floorId = this._map.floorId();
        const table = this._map.land2().landData().appearanceTable;
        if (table.enemies.length == 0) return;    // 出現テーブルが空
        const list = table.enemies[floorId.floorNumber()];
        if (list.length == 0) return;    // 出現テーブルが空

        const data = list[REGame.world.random().nextIntWithMax(list.length)];
        if (data.spawiInfo.troopId > 0) {
            SEntityFactory.spawnTroopAndMembers( REData.troops[data.spawiInfo.troopId], mx, my, data.spawiInfo.stateIds);
        }
        else {
            const entity = SEntityFactory.newEntity(data.spawiInfo);
            REGame.world._transferEntity(entity, floorId, mx, my);
        }
    }

    /** 出現テーブルからランダムに選択して Item を作る */
    private spawnItem(mx: number, my: number): void {
        const floorId = this._map.floorId();
        const table = this._map.land2().landData().appearanceTable;
        if (table.items.length == 0) return undefined;    // 出現テーブルが空
        const list = table.items[floorId.floorNumber()];
        if (list.length == 0) return undefined;    // 出現テーブルが空

        const data = list[REGame.world.random().nextIntWithMax(list.length)];
        const entity = SEntityFactory.newEntity(data.spawiInfo);
        REGame.world._transferEntity(entity, floorId, mx, my);
    }

    /** 出現テーブルからランダムに選択して Trap を作る */
    private spawnTrap(mx: number, my: number): void {
        const floorId = this._map.floorId();
        const table = this._map.land2().landData().appearanceTable;
        if (table.traps.length == 0) return undefined;    // 出現テーブルが空
        const list = table.traps[floorId.floorNumber()];
        if (list.length == 0) return undefined;    // 出現テーブルが空

        const data = list[REGame.world.random().nextIntWithMax(list.length)];
        const entity = SEntityFactory.newEntity(data.spawiInfo);
        REGame.world._transferEntity(entity, floorId, mx, my);
    }
}

