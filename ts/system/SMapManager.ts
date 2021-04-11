

import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";
import { LMap } from "ts/objects/LMap";
import { SEntityFactory } from "./SEntityFactory";
import { assert } from "ts/Common";
import { paramEnemySpawnInvalidArea } from "ts/PluginParameters";
import { FMap } from "ts/floorgen/FMapData";
import { REData } from "ts/data/REData";
import { DPrefabKind } from "ts/data/DPrefab";
import { LObjectType } from "ts/objects/LObject";
import { BlockLayerKind, REGame_Block } from "ts/objects/REGame_Block";


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

        if (newFloorId.isRandomMap()) {
            RESystem.integration.onRefreshGameMap(REGame.map, initialMap);
        }
        else {
            RESystem.integration.onLoadFixedMapEvents();
        }

        // 階段を配置する
        {
            
            const exitPoint = initialMap.exitPont();
            if (exitPoint) {
                const appearanceTable = REData.lands[map.floorId().landId()].appearanceTable;
                const prefab = appearanceTable.others[map.floorId().floorNumber()].find(e => {
                    const p = REData.prefabs[e.entity.prefabId];
                    return p.kind == DPrefabKind.System && p.rmmzDataKey == "RE-SystemPrefab:ExitPoint";
                });
                assert(prefab);


                const entity = SEntityFactory.newExitPoint();
                entity.prefabKey = prefab.prefabName;
                
                console.log("exitPoint prefab", prefab);
                console.log("exitPoint floorId", map.floorId());
                REGame.world._transferEntity(entity, map.floorId(), exitPoint.mx(), exitPoint.my());
                
                console.log("_transferEntity e");
            }
        }
        
        const enterdEntities = this.enterEntitiesToCurrentMap();

        
        if (this._map.floorId().isRandomMap()) {
            
            console.log("isRandomMap w");
            //const objects = REGame.world.objects();
            for (const entity of enterdEntities) {
            //for (let i = 1; i < objects.length; i++) {
            //    const obj = objects[i];
            //    if (obj && obj.objectType() == LObjectType.Entity) {
                    //const entity = obj as LEntity;
                    if (entity.floorId.equals(this._map.floorId())) {

                        console.log("locateEntity w");

                        const layer = entity.queryProperty(RESystem.properties.homeLayer);
                        const block = this.findSpawnableBlockRandom(entity, layer);
                        assert(block);
                        
                        this._map.locateEntity(entity, block.x(), block.y());
                        
                        //const block = this.block(entity.x, entity.y);
                        //const layer = entity.queryProperty(RESystem.properties.homeLayer);
                        //block.addEntity(layer, entity);
                        //this._map._addEntityInternal(entity);
                    }
                //}
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
                const isNoEnterd = !entity.hasOwner();

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

    private findSpawnableBlockRandom(entity: LEntity, layer: BlockLayerKind): REGame_Block | undefined {
        

        // 
        const spawnableBlocks = this._map.roomFloorBlocks().filter(b => b.isContinuation() && !b.layer(layer).isContainsAnyEntity());
        if (spawnableBlocks.length == 0) return undefined;

        const candidateBlocks = spawnableBlocks;
        if (candidateBlocks.length == 0) return undefined;
        
        return candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
    }

    private spawnRandomEnemy(): void {
        const floorId = this._map.floorId();


        // 出現テーブルからランダムに選択して Entity を作る
        const enemies = this._map.land2().landData().appearanceTable.enemies[floorId.floorNumber()];
        const data = enemies[REGame.world.random().nextIntWithMax(enemies.length)];
        const entity = SEntityFactory.newEntity(data.entity);

        // 空いている Block をランダムに選択して配置する
        const spawnableBlocks = this._map.unitSpawnableBlocks();
        assert(spawnableBlocks.length > 0);

        const player = REGame.camera.focusedEntity();
        assert(player);
        const px = player.x;
        const py = player.y;

        const candidateBlocks = spawnableBlocks.filter(b => Math.abs(b.x() - px) > paramEnemySpawnInvalidArea && Math.abs(b.y() - py) > paramEnemySpawnInvalidArea);
        if (candidateBlocks.length > 0) {
            const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
            REGame.world._transferEntity(entity, floorId, block.x(), block.y());

            console.log("spawn enemy:", entity);
            console.log("spawn on:", block);
        }
        else {
            // 非常に小さい単一の部屋しかなかったようなケース
        }

    }
}

