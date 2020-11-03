import { REDataManager } from "./data/REDataManager";
import { REGame } from "./RE/REGame";
import { REGameManager } from "./system/REGameManager";

declare global {
    interface Game_Map {
        isRESystemMap(): boolean;
        //setTileData(x: number, y: number, z: number, value: number): void;
    }
}

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
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


    /*
    console.log("OK");
    console.log($dataMap.data?.length);
    this.setTileData(0, 0, 0, 1);
    this.setTileData(0, 0, 1, 1);
    this.setTileData(0, 0, 2, 1);
    this.setTileData(0, 0, 3, 1);
    this.setTileData(0, 0, 4, 1);
    this.setTileData(0, 0, 5, 1);
    */
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
        REGameManager.update();
    }
}

Game_Map.prototype.isRESystemMap = function(): boolean {
    return REGame.map.isValid();
}
