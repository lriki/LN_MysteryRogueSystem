import { DItemEquipmentSide } from "ts/data/DEntityProperties";
import { DItemDataId } from "ts/data/DItem";
import { REData } from "ts/data/REData";
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

interface SpriteData {
    imageName: string;
    sprite: Sprite | undefined;
    itemId: DItemDataId;
}

/**
 * 
 */
export class VCharacterSpriteSet {
    private _parent: Spriteset_Map;
    private _owner: Sprite_Character;
    //private _weaponSprite: Sprite;
    //private _shieldSprite: Sprite;

    private _sprites: SpriteData[];
    private _revisionNumber: number;

    constructor(parent: Spriteset_Map, owner: Sprite_Character) {
        this._parent = parent;
        this._owner = owner;
        this._sprites = [];
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

                // 装備中のアイテムリストとスプライト情報の配列サイズを揃えておく
                while(this._sprites.length > items.length) {
                    this._sprites[this._sprites.length - 1].sprite?.destroy();
                    this._sprites.pop();
                }
                while(this._sprites.length < items.length) { 
                    this._sprites.push({
                        imageName: "",
                        sprite: undefined,
                        itemId: 0,
                    });
                 }
                /*
                for (let i = 0; i < items.length; i++) {
                    if (!this._sprites[i]) {
                        this._sprites[i] = {
                            imageName: "",
                            sprite: undefined,
                            itemId: 0,
                        };
                    }
                }
                */



                for (let i = 0; i < items.length; i++) {

                    
                    const newImage = items[i].entity.equipmentImage.name;
                    const current = (i < this._sprites.length) ? this._sprites[i].imageName : "";

                    const spriteData = this._sprites[i];
                    spriteData.itemId = items[i].id;

                    if (current != newImage) {
                        this._sprites[i].imageName = newImage;
                        if (!spriteData.sprite) {
                            spriteData.sprite = new Sprite(undefined);
                        }
                        spriteData.sprite.bitmap = ImageManager.loadCharacter(newImage);
                        spriteData.sprite.visible = false;
                        spriteData.sprite.anchor.x = 0.5;
                        spriteData.sprite.anchor.y = 1.0;
                    }
                    else if (newImage == "" && spriteData.sprite) {
                        spriteData.sprite.bitmap = undefined;
                    }
                }

                // 一度除外する
                for (const s of this._sprites) {
                    if (s.sprite) this._parent.removeChild(s.sprite);
                }

                // 装備スロットIDの若い方が上に表示されるように追加する
                for (const s of this._sprites.slice().reverse()) {
                    if (s.sprite) this._parent.addChild(s.sprite);
                }

                this._revisionNumber = equipments.revisitonNumber();
            }

            const pw = this._owner.patternWidth();
            const ph = this._owner.patternHeight();
            const sx = (this._owner.characterBlockX() + this._owner.characterPatternX()) * pw;
            const sy = (this._owner.characterBlockY() + this._owner.characterPatternY()) * ph;
            const d = this._owner._character.direction();
            for (const s of this._sprites) {
                if (s.sprite) {
                    s.sprite.setFrame(sx, sy, pw, ph);
                    s.sprite.position = this._owner.position;
                    s.sprite.visible = true;
                    if (REData.items[s.itemId].entity.equipmentImage.side == DItemEquipmentSide.Right) {
                        s.sprite.z = this._owner.z + ZOFFSET_TABLE_RIGHT_HAND[d];
                    }
                    else {
                        s.sprite.z = this._owner.z + ZOFFSET_TABLE_LEFT_HAND[d];
                    }
                }
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
            for (const s of this._sprites) {
                if (s.sprite) {
                    s.sprite.visible = true;
                }
            }
        }
    }
}

