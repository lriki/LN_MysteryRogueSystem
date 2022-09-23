import { REVisual } from "ts/mr/view/REVisual";
import { REVisual_Entity } from "ts/mr/view/REVisual_Entity";
import { VCharacterSpriteSet } from "ts/mr/view/VCharacterSpriteSet";
import { VHelper } from "ts/mr/view/VHelper";
import { assert } from "../Common";
import { Sprite_CharacterDamage_RE } from "./Sprite_CharacterDamage_RE";

declare global {
    interface Sprite_Character {
        _spriteSet: VCharacterSpriteSet | undefined;

        _spriteIndex: number;

        // StateIcon 関係
        _stateIconSprite: Sprite;
        _stateIcons: number[];
        _reRevision: number;

        setStateIcons(icons: number[]): void;
        
        // 動的イベント関係
        //_prefabSpriteIdRE: number;
        //isRECharacterExtinct(): boolean;
        endAllEffect(): void;
        removeREPrefabEventSprite(index: number): void;
        findVisual(): REVisual_Entity | undefined;

        _damageSprites_RE: Sprite_CharacterDamage_RE[];
        updateDamagePopup_RE(): void;
        attemtSetupDamagePopup_RE(): void;
        setupDamagePopupFlash_RE(): void;
        damageOffsetX_RE(): number;
        damageOffsetY_RE(): number;
        getPopupParent_RE(): PIXI.Container;
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

    this._reRevision = 0;
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

    if (this._reRevision != this._character.reRevision()) {
        this._reRevision = this._character.reRevision();
        this._stateIcons = [];
        this._stateIconSprite.visible = false;
    }


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
                VHelper.setIconFrame(this._stateIconSprite, this._stateIcons[0]);   // TODO: 複数
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

    this.updateDamagePopup_RE();
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

Sprite_Character.prototype.updateDamagePopup_RE = function() {
    this.attemtSetupDamagePopup_RE();
    if (this._damageSprites_RE && this._damageSprites_RE.length > 0) {
        for (var i = 0; i < this._damageSprites_RE.length; i++) {
            this._damageSprites_RE[i].update();
        }
        if (!this._damageSprites_RE[0].isPlaying()) {
            this.getPopupParent_RE().removeChild(this._damageSprites_RE[0] as any);
            this._damageSprites_RE.shift();
        }
    }
    // if (this._popupFlash) {
    //     this.updateDamagePopupFlash();
    // }
}

Sprite_Character.prototype.attemtSetupDamagePopup_RE = function(): void {
    
    if (!this._character.isDamagePopupRequested_RE()) return;
    var sprite = new Sprite_CharacterDamage_RE();
    sprite.x   = this.x + this.damageOffsetX_RE();
    sprite.y   = this.y + this.damageOffsetY_RE();
    if (!sprite.z) sprite.z = 9;
    sprite.setupCharacter(this._character);
    if (!this._damageSprites_RE) this._damageSprites_RE = [];
    this._damageSprites_RE.push(sprite);
    this.getPopupParent_RE().addChild(sprite as any);
    //this._character.clearDamagePopup();
    // if (!sprite.isMiss() && !sprite.isRecover()) {
    //     this.setupDamagePopupFlash();
    // }
}

// Sprite_Character.prototype.setupDamagePopupFlash_RE = function() {
//     var flashColor = $gameSystem.getPopupDamageFlash();
//     if (!flashColor) return;
//     this._popupFlash      = flashColor.clone();
//     this._popupFlashSpeed = Math.floor(this._popupFlash[3] / 30);
//     this.updateDamagePopupFlash();
// }

Sprite_Character.prototype.damageOffsetX_RE = function(): number {
    return 0;
}

Sprite_Character.prototype.damageOffsetY_RE = function(): number {
    return 0;
}

Sprite_Character.prototype.getPopupParent_RE = function(): PIXI.Container {
    return this.parent;
    //return paramOnTop ? this.parent.parent.parent : this.parent;
}
