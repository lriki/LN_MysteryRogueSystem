

import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";
import { LMap } from "ts/objects/LMap";
import { SEntityFactory } from "./SEntityFactory";
import { assert } from "ts/Common";
import { paramEnemySpawnInvalidArea } from "ts/PluginParameters";


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

