import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";

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
    //private _weaponSprite: Sprite;
    //private _shieldSprite: Sprite;

    private _imageNames: string[];
    private _equipmentSprites: Sprite[];
    private _revisionNumber: number;

    constructor(parent: Spriteset_Map, owner: Sprite_Character) {
        this._parent = parent;
        this._owner = owner;
        this._imageNames = [];
        this._equipmentSprites = [];
        this._revisionNumber = 0;

        /*
        const weaponBitmap = ImageManager.loadCharacter("RE-Weapon-1");
        this._weaponSprite = new Sprite(weaponBitmap);
        this._weaponSprite.visible = false;
        this._weaponSprite.anchor.x = 0.5;
        this._weaponSprite.anchor.y = 1.0;
        this._parent.addChild(this._weaponSprite);
        
        const shieldBitmap = ImageManager.loadCharacter("RE-Shield-1");
        this._shieldSprite = new Sprite(shieldBitmap);
        this._shieldSprite.visible = false;
        this._shieldSprite.anchor.x = 0.5;
        this._shieldSprite.anchor.y = 1.0;
        this._parent.addChild(this._shieldSprite);
        */
    }

    public update(): void {
        const visual = this._owner.findVisual();
        const equipments = visual?.entity().findBehavior(LEquipmentUserBehavior);

        if (visual && equipments) {
            if (this._revisionNumber != equipments.revisitonNumber()) {
                const items = equipments.equippedItems();
                console.log("items", items);
                for (let i = 0; i < items.length; i++) {
                    const newImage = items[i].entity.equipmentImage.name;
                    const current = (i < this._imageNames.length) ? this._imageNames[i] : "";
                    if (current != newImage) {
                        this._imageNames[i] = newImage;
                        if (!this._equipmentSprites[i]) {
                            this._equipmentSprites[i] = new Sprite(undefined);
                        }
                        this._equipmentSprites[i].bitmap = ImageManager.loadCharacter(newImage);
                        this._equipmentSprites[i].visible = false;
                        this._equipmentSprites[i].anchor.x = 0.5;
                        this._equipmentSprites[i].anchor.y = 1.0;
                    }
                    else if (newImage == "" && this._equipmentSprites[i]) {
                        this._equipmentSprites[i].bitmap = undefined;
                    }
                }

                // 一度除外する
                this._equipmentSprites.forEach(s => this._parent.removeChild(s));

                // 装備スロットIDの若い方が上に表示されるように追加する
                this._equipmentSprites.slice().reverse().forEach(s => this._parent.addChild(s));

                this._revisionNumber = equipments.revisitonNumber();

                
                console.log("refresh", this._revisionNumber);
                console.log("visual", visual);
                console.log("_imageNames", this._imageNames);
                console.log("_equipmentSprites", this._equipmentSprites);
            }



            const pw = this._owner.patternWidth();
            const ph = this._owner.patternHeight();
            const sx = (this._owner.characterBlockX() + this._owner.characterPatternX()) * pw;
            const sy = (this._owner.characterBlockY() + this._owner.characterPatternY()) * ph;
            for (const sprite of this._equipmentSprites) {

            }
/*
            this._weaponSprite.setFrame(sx, sy, pw, ph);
            this._shieldSprite.setFrame(sx, sy, pw, ph);
            this._weaponSprite.position = this._owner.position;
            this._shieldSprite.position = this._owner.position;
    
            const d = this._owner._character.direction();
            this._weaponSprite.z = this._owner.z + ZOFFSET_TABLE_RIGHT_HAND[d];
            this._shieldSprite.z = this._owner.z + ZOFFSET_TABLE_LEFT_HAND[d];

            this._weaponSprite.visible = true;
            this._shieldSprite.visible = true;
            */
        }
        else {
            for (const sprite of this._equipmentSprites) {
                sprite.visible = false;
            }
        }
    }
}

