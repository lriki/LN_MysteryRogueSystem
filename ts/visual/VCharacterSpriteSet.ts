
const ZOFFSET_TABLE_RIGHT_HAND = [
    0,
    -1, 1, 1,
    -1, 0, 1,
    -1, -1, 1,
];

const ZOFFSET_TABLE_LEFT_HAND = [
    0,
    1, 1, -1,
    1, 0, -1,
    1, -1, -1,
];

/**
 * 
 */
export class VCharacterSpriteSet {
    private _parent: Spriteset_Map;
    private _owner: Sprite_Character;
    private _weaponSprite: Sprite;
    private _shieldSprite: Sprite;


    constructor(parent: Spriteset_Map, owner: Sprite_Character) {
        //parent.sortableChildren = true;
        this._parent = parent;
        this._owner = owner;

        const weaponBitmap = ImageManager.loadCharacter("RE-Weapon-1");
        this._weaponSprite = new Sprite(weaponBitmap);
        this._weaponSprite.visible = true;//false;
        this._weaponSprite.anchor.x = 0.5;
        this._weaponSprite.anchor.y = 1.0;
        this._parent.addChild(this._weaponSprite);
        
        const shieldBitmap = ImageManager.loadCharacter("RE-Shield-1");
        this._shieldSprite = new Sprite(shieldBitmap);
        this._shieldSprite.visible = true;//false;
        this._shieldSprite.anchor.x = 0.5;
        this._shieldSprite.anchor.y = 1.0;
        this._parent.addChild(this._shieldSprite);
    }

    public update() {
        const pw = this._owner.patternWidth();
        const ph = this._owner.patternHeight();
        const sx = (this._owner.characterBlockX() + this._owner.characterPatternX()) * pw;
        const sy = (this._owner.characterBlockY() + this._owner.characterPatternY()) * ph;
        this._weaponSprite.setFrame(sx, sy, pw, ph);
        this._shieldSprite.setFrame(sx, sy, pw, ph);
        this._weaponSprite.position = this._owner.position;
        this._shieldSprite.position = this._owner.position;

        const d = this._owner._character.direction();
        this._weaponSprite.z = this._owner.z + ZOFFSET_TABLE_RIGHT_HAND[d];
        this._shieldSprite.z = this._owner.z + ZOFFSET_TABLE_LEFT_HAND[d];
    }
}

