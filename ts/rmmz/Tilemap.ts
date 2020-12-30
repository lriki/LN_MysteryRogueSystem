import { REGame } from "ts/objects/REGame";

const startTileId = 768;


const _Tilemap__addSpot = Tilemap.prototype._addSpot;
Tilemap.prototype._addSpot = function(startX, startY, x, y) {
    _Tilemap__addSpot.call(this, startX, startY, x, y);

    const mx = startX + x;
    const my = startY + y;
    const dx = x * this._tileWidth;
    const dy = y * this._tileHeight;
    const tileId5 = this._readMapData(mx, my, 5);   // region

    
    const tileId0 = this._readMapData(mx, my, 0);
    const tileId1 = this._readMapData(mx, my, 1);
    const tileId2 = this._readMapData(mx, my, 2);
    const tileId3 = this._readMapData(mx, my, 3);
    const tileId4 = this._readMapData(mx, my, 4);

    //if (REGame.map.isValid()) {
    if (0) {
        const block = REGame.map.block(mx, my);
        if (block._roomId > 0) {
            this._addTile(this._upperLayer, startTileId + block._roomId, dx, dy);
        }
    }

        /*
    if (tileId5 == 8) {
        console.log("m", mx, my);
        console.log("tileId5", tileId5);
        console.log("tileId0", tileId0);
        console.log("tileId1", tileId1);
        console.log("tileId2", tileId2);
        console.log("tileId3", tileId3);
        console.log("tileId4", tileId4);
        throw new Error();
        this._addTile(this._upperLayer, startTileId + 1, dx, dy);
    }

    if (tileId5 == 1) {
        console.log("m", mx, my);
        console.log("tileId5", tileId5);
        console.log("tileId0", tileId0);
        console.log("tileId1", tileId1);
        console.log("tileId2", tileId2);
        console.log("tileId3", tileId3);
        console.log("tileId4", tileId4);
        throw new Error();
        this._addTile(this._upperLayer, startTileId + 10, dx, dy);
    }
    */
}
