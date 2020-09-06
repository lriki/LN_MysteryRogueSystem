import { RE_DataManager } from "./RE/RE_DataManager";
import { assert } from "./Common";

declare global {
    interface Game_Map {
        setTileData(x: number, y: number, z: number, value: number): void;
    }
}

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
    _Game_Map_setup.call(this, mapId);

    // この時点ではまだ Player は locate() されていないので、
    // 位置をとりたければ _newX, _newY を見る必要がある。
    //console.log("Game_Map initialized.", $gamePlayer._newX);
    //console.log($gamePlayer);

    
    console.log("OK");
    this.setTileData(0, 0, 0, 1);
}


Game_Map.prototype.setTileData = function(x: number, y: number, z: number, value: number) : void {
    const width = this.width();
    const height = this.height();
    assert(0 <= x && x < width && 0 <= y && y < height);

    const data = $dataMap.data;
    if (data) {
        data[(z * height + y) * width + x] = value;
    }
}

