

import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";
import { REGame_Map } from "ts/objects/REGame_Map";


/**
 * LMap へのアイテムや敵の生成・配置など、ゲーム進行に伴う Map 上の変化を管理するクラス。
 */
export class SMapManager {
    private _map: REGame_Map;
    private _enemySpanwRate: number = 20;
    private _enemySpawnCount: number = 0;   // 

    constructor() {
        this._map = REGame.map;
        this._enemySpawnCount = this._enemySpanwRate;
    }

    public setMap(map: REGame_Map): void {
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

    }
}

