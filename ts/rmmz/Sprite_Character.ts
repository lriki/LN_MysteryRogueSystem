import { REVisual } from 'ts/visual/REVisual';
import { REVisual_Entity } from 'ts/visual/REVisual_Entity';
import { VCharacterSpriteSet } from 'ts/visual/VCharacterSpriteSet';
import { assert } from '../Common';

declare global {
    interface Sprite_Character {
        _spriteSet: VCharacterSpriteSet | undefined;

        _spriteIndex: number;

        // StateIcon 関係
        _stateIconSprite: Sprite;
        _stateIcons: number[];
        setStateIcons(icons: number[]): void;
        
        // 動的イベント関係
        //_prefabSpriteIdRE: number;
        isRECharacterExtinct(): boolean;
        endAllEffect(): void;
        removeREPrefabEventSprite(index: number): void;
        findVisual(): REVisual_Entity | undefined;
    }
}

const dir8PatternYTable: number[] = [
    0,
    4, 0, 6,
    1, 0, 2,
    5, 3, 7,
];

const dir4PatternYTable: number[] = [
    0,
    0, 0, 0,
    1, 0, 2,
    3, 3, 3,
];

Sprite_Character.prototype.setStateIcons = function(icons: number[]): void {
    this._stateIcons = icons;
}

const _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);

    this._stateIcons = [];
    const bitmap = ImageManager.loadSystem("IconSet");
    this._stateIconSprite = new Sprite(bitmap);
    this._stateIconSprite.visible = false;  // ちらつき回避
    this.addChild(this._stateIconSprite);
}

// 8 方向パターン
const _Sprite_Character_characterPatternY = Sprite_Character.prototype.characterPatternY;
Sprite_Character.prototype.characterPatternY = function() {
    if (this._character.characterName().endsWith("-X")) {
        return dir8PatternYTable[this._character.direction()];
    }
    else {
        return dir4PatternYTable[this._character.direction()];
    }
}


const _Sprite_Character_update = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
    _Sprite_Character_update.call(this);

    const visual = this.findVisual();
    if (visual) {
        if (!this._spriteSet) {
            this._spriteSet = new VCharacterSpriteSet(this.parent as Spriteset_Map, this);
        }
    
        if (this._spriteSet) {
            this._spriteSet.update();
        }

        // Update state icon
        {
            if (this._stateIcons.length > 0) {
                const iconIndex = this._stateIcons[0];  // TODO: 複数
                const pw = ImageManager.iconWidth;
                const ph = ImageManager.iconHeight;
                const sx = (iconIndex % 16) * pw;
                const sy = Math.floor(iconIndex / 16) * ph;
                this._stateIconSprite.setFrame(sx, sy, pw, ph);
                this._stateIconSprite.anchor.x = 0.5;
                this._stateIconSprite.anchor.y = 1;
                this._stateIconSprite.y = this.bitmap ? -this.patternHeight() : 0;  // bitmap が無いと Character の高さが取れないので
                this._stateIconSprite.visible = true;
            }
            else {
                this._stateIconSprite.visible = false;
            }
        }

        // 寿命管理が複雑なので、間違ったものを参照していないか検証しておく
        if (visual.rmmzSpriteIndex() != this._spriteIndex) {
            console.log("err", this);
        }
        assert(visual.rmmzSpriteIndex() == this._spriteIndex);
    }
    else {
        this._stateIconSprite.visible = false;
    }

}

Sprite_Character.prototype.isRECharacterExtinct = function(): boolean {
    return this._character.isREExtinct();
}


Sprite_Character.prototype.endAllEffect = function() {
    // TODO: https://raw.githubusercontent.com/triacontane/RPGMakerMV/master/EventReSpawn.js
}

Sprite_Character.prototype.findVisual = function(): REVisual_Entity | undefined {
    if (!REVisual.entityVisualSet) return undefined;

    const event = this._character;
    if (event instanceof Game_Event) {
        const visual = REVisual.entityVisualSet.findEntityVisualByRMMZEventId(event.eventId());
        return visual;
    }
    else {
        return undefined;
    }
}
