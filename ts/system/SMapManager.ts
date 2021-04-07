

import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";
import { LMap } from "ts/objects/LMap";
import { REEntityFactory } from "./REEntityFactory";


/**
 * LMap へのアイテムや敵の生成・配置など、ゲーム進行に伴う Map 上の変化を管理するクラス。
 */
export class SMapManager {
    private _map: LMap;
    private _enemySpanwRate: number = 20;
    private _enemySpawnCount: number = 0;   // 

    constructor() {
        this._map = REGame.map;
        this._enemySpawnCount = this._enemySpanwRate;
    }

    public setMap(map: LMap): void {
        this._map = map;
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

    private spawnRandomEnemy(): void {
        const floorId = this._map.floorId();

        // 出現テーブルからランダムに選択して Entity を作る
        const enemies = this._map.land().appearanceTable.enemies[floorId.floorNumber()];
        const item = enemies[REGame.world.random().nextIntWithMax(enemies.length)];
        const entity = REEntityFactory.newEntity(item.entity);

        // 空いている Block をランダムに選択して配置する
        const candidateBlocks = this._map.unitSpawnableBlocks();
        const block = candidateBlocks[REGame.world.random().nextIntWithMax(candidateBlocks.length)];
        REGame.world._transferEntity(entity, floorId, block.x(), block.y());
    }
}

