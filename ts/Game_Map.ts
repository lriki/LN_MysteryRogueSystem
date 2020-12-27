import { Log } from "./Common";
import { REDataManager } from "./data/REDataManager";
import { REGame } from "./objects/REGame";
import { REGameManager } from "./system/REGameManager";

declare global {
    interface Game_Map {
        isRESystemMap(): boolean;
        //setTileData(x: number, y: number, z: number, value: number): void;
    }
}

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {

    // 先に REMap をクリーンアップしておく。
    // 内部から onEntityLeavedMap() が呼び出され、ここで Game_Event の erase が走るため、
    // Game_Map 構築後にクリーンアップしてしまうと、新しく作成された Event が消えてしまう。
    REGame.map.releaseMap();

    _Game_Map_setup.call(this, mapId);


    // この時点ではまだ Player は locate() されていないので、
    // 位置をとりたければ _newX, _newY を見る必要がある。
    //console.log("Game_Map initialized.", $gamePlayer._newX);
    //console.log($gamePlayer);

    if (REDataManager.isRESystemMap(mapId)) {
        if (1)  // TODO: 固定マップの場合
        {
            REGame.map.setup(mapId);


            
        }
        $gamePlayer.hideFollowers();
    }

    Log.d("RMMZ map setup finished.");
}


    /*
Game_Map.prototype.setTileData = function(x: number, y: number, z: number, value: number) : void {
    const width = this.width();
    const height = this.height();
    assert(0 <= x && x < width && 0 <= y && y < height);

    const data = $dataMap.data;
    if (data) {
        data[(z * height + y) * width + x] = value;
    }
}
*/

var _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive: boolean) {
    _Game_Map_update.call(this, sceneActive);

    if (this.isRESystemMap()) {
        if (!this.isEventRunning()) {   // イベント実行中はシミュレーションを行わない

            if (REGame.camera.isFloorTransfering()) {
                // マップ遷移中はコアシステムとしては何もしない。
                // performFloorTransfer() すること。
                return;
            }
            else {
                REGame.scheduler.stepSimulation();
            }
        }
    }
    else {
        // 普通のマップの時は、Command 実行用の Scheduler をずっと動かしておく
        REGame.immediatelyCommandExecuteScheduler.stepSimulation();
    }
}

Game_Map.prototype.isRESystemMap = function(): boolean {
    return REGame.map.isValid();
}
