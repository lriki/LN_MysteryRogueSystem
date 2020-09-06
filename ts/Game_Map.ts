
var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {
    _Game_Map_setup.call(this, mapId);

    // この時点ではまだ Player は locate() されていないので、
    // 位置をとりたければ _newX, _newY を見る必要がある。
    console.log("Game_Map initialized.", $gamePlayer._newX);
    console.log($gamePlayer);

    
    console.log($dataMap);
    if ($dataMap.meta.LNRE_LandMap) {
        console.log("OK");
    }
}

