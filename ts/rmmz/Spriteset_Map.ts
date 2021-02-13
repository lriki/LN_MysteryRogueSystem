

import { assert } from '../Common';
import { REGame } from '../objects/REGame';
import { REVisual } from '../visual/REVisual';

declare global {
    interface Spriteset_Map {
        _minimapTilemap: Tilemap;
    }
}


var _Spriteset_Map_prototype_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_prototype_createLowerLayer.call(this);

    
    const width = $dataMap.width ?? 1;
    const height = $dataMap.height ?? 1;
    const depth = 4;
    const minimapData = new Array(width * height * 4);
    const x = 0;
    const y = 0;
    const z = 0;
    minimapData[(z * height + y) * width + x] = Tilemap.TILE_ID_A5 + 1;
    minimapData[(z * height + y) * width + x+1] = Tilemap.TILE_ID_A5 + 1;
    
    this._minimapTilemap = new Tilemap();
    this._minimapTilemap._tileWidth = 12;//$gameMap.tileWidth();
    this._minimapTilemap._tileHeight = 12;//$gameMap.tileHeight();
    //this._minimapTilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
    this._minimapTilemap.setData(width, height, minimapData);
    this._minimapTilemap.horizontalWrap = $gameMap.isLoopHorizontal();
    this._minimapTilemap.verticalWrap = $gameMap.isLoopVertical();
    this._baseSprite.addChild(this._minimapTilemap);

    this._minimapTilemap.setRendererId(1);
    
    const bitmaps = [];
    const tilesetNames = ["World_A1","RE-Minimap_A2","","","RE-Minimap_A5","World_B","World_C","",""];
    for (const name of tilesetNames) {
        bitmaps.push(ImageManager.loadTileset(name));
    }
    this._minimapTilemap.setBitmaps(bitmaps);
}

var _Spriteset_Map_prototype_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_prototype_createCharacters.call(this);
    REVisual.spriteset = this;
};

var _Spriteset_Map_prototype_updateTilemap = Spriteset_Map.prototype.updateTilemap;
Spriteset_Map.prototype.updateTilemap = function() {
    _Spriteset_Map_prototype_updateTilemap.call(this);
    
    const minimap = REGame.minimapData;
    if (minimap.isTilemapResetNeeded()) {
        this._minimapTilemap.setData(minimap.width(), minimap.height(), minimap.data());
        minimap.clearTilemapResetNeeded();
    }
    this._minimapTilemap.refresh();
}

/*
declare global {
    interface Spriteset_Map {
        onSpawnMapSkillEffectEvent(event: Game_Event): void;
        onDespawnMapSkillEffectEvent(event: Game_Event): void;
    }
}



Spriteset_Map.prototype.onSpawnMapSkillEffectEvent = function(event: Game_Event) {
    let sprite = new Sprite_Character(event);
    this._characterSprites.push(sprite);
    this._tilemap.addChild(sprite);
}

Spriteset_Map.prototype.onDespawnMapSkillEffectEvent = function(despawndEvent: Game_Event) {
    assert(despawndEvent._eventIndex != undefined);
    for (let i = 0; i < this._characterSprites.length; i++) {
        let character = this._characterSprites[i]._character;
        let event = (character as Game_Event);
        if (event) {
            if (event._eventIndex != undefined) {
                if (event._eventIndex == despawndEvent._eventIndex) {
                    this._tilemap.removeChild(this._characterSprites[i]);
                    this._characterSprites.splice(i, 1);
                    break;
                }
            }
        }
    }
}
*/
