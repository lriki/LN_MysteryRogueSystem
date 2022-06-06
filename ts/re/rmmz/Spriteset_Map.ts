

import { VSpriteSet } from "ts/re/visual/VSpriteSet";
import { assert } from "../Common";
import { REVisual } from "../visual/REVisual";
import { RMMZHelper } from "./RMMZHelper";






declare global {
    interface Spriteset_Map {

        createVisibilityShadowPart(frame: number, anchorX: number, anchorY: number): Sprite;
    }
}

const _Spriteset_Map_initialize = Spriteset_Map.prototype.initialize;
Spriteset_Map.prototype.initialize = function(): void {
    assert(!REVisual.spriteSet2);
    _Spriteset_Map_initialize.call(this);
}

const _Spriteset_Map_destroy = Spriteset_Map.prototype.destroy;
Spriteset_Map.prototype.destroy = function(options) {
    _Spriteset_Map_destroy.call(this, options);
}

var _Spriteset_Map_prototype_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_prototype_createLowerLayer.call(this);
}

var _Spriteset_Map_prototype_createPictures = Spriteset_Map.prototype.createPictures;
Spriteset_Map.prototype.createPictures = function() {

    if (RMMZHelper.isRESystemMap()) {
        // VisibilityShadow はピクチャなどよりも先に描画したいので、Picture のレイヤーよりも先に作っておく
        REVisual.spriteSet2 = new VSpriteSet(this);
    }
    else {
        REVisual.spriteSet2 = undefined;
    }

    _Spriteset_Map_prototype_createPictures.call(this);
}

var _Spriteset_Map_prototype_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    _Spriteset_Map_prototype_createCharacters.call(this);
    REVisual.spriteset = this;
};


var _Spriteset_Map_prototype_updateTilemap = Spriteset_Map.prototype.updateTilemap;
Spriteset_Map.prototype.updateTilemap = function() {
    _Spriteset_Map_prototype_updateTilemap.call(this);

    // SpriteSet、特に VisibilityShadow の更新は Tilemap のタイミングと合わせないと微妙に位置がずれたりする。
    REVisual.spriteSet2?.update();
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


//--------------------------------------------------------------------------------
// VisibilityShadow


var _Spriteset_Map_prototype_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
Spriteset_Map.prototype.createUpperLayer = function() {

    _Spriteset_Map_prototype_createUpperLayer.call(this);
}

var _Spriteset_Map_prototype_updateShadow = Spriteset_Map.prototype.updateShadow;
Spriteset_Map.prototype.updateShadow = function() {

    _Spriteset_Map_prototype_updateShadow.call(this);
}


