import { DItemEquipmentSide } from "ts/mr/data/DEntityProperties";
import { DItemDataId } from "ts/mr/data/DItem";
import { MRData } from "ts/mr/data/MRData";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { DEntityId } from "../data/DEntity";
import { LEntityIdData } from "../lively/activities/LActivity";
import { paramDirectionCircleEnabled } from "../PluginParameters";
import { easing } from "./animation/VEasing";
import { VEasingAnimationCurve } from "./animation/VAnimation";

const CIRCLE_ANIMATION_FRAMES = 60;

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
    itemEntityDataId: DEntityId;
}

/**
 * 
 */
export class VCharacterSpriteSet {
    private _parent: Spriteset_Map;
    private _owner: Sprite_Character;

    private _sprites: SpriteData[];
    private _revisionNumber: number;

    private _directionCircle: Sprite | undefined;
    private _directionCircleEffect: Sprite | undefined;
    private _easingAnimationCurve: VEasingAnimationCurve;
    private _directionCircleAnimationCount: number;

    constructor(parent: Spriteset_Map, owner: Sprite_Character) {
        this._parent = parent;
        this._owner = owner;
        this._sprites = [];
        this._revisionNumber = 0;
        this._easingAnimationCurve = new VEasingAnimationCurve(0, 1.0, CIRCLE_ANIMATION_FRAMES, easing.outQuad);
        this._directionCircleAnimationCount = 0;
    }

    public update(): void {
        if (paramDirectionCircleEnabled) {
            if (!this._directionCircle) {
                this._directionCircle = new Sprite(ImageManager.loadSystem("MR-DirectionCircle"));
                this._directionCircle.setFrame(0, 0, 64, 64);
                this._directionCircle.anchor.x = 0.5;
                this._directionCircle.anchor.y = 0.5;
                // this._directionCircle.scale.x = 1.0;
                // this._directionCircle.scale.y = 0.5;
                this._directionCircle.z = this._owner.z-2;
                //this._directionCircle.blendMode = 1;
                this._parent.addChild(this._directionCircle);
                
                this._directionCircleEffect = new Sprite(ImageManager.loadSystem("MR-DirectionCircle"));
                this._directionCircleEffect.setFrame(0, 0, 64, 64);
                this._directionCircleEffect.anchor.x = 0.5;
                this._directionCircleEffect.anchor.y = 0.5;
                this._directionCircleEffect.z = this._owner.z-2;
                //this._directionCircleEffect.blendMode = 1;
                this._parent.addChild(this._directionCircleEffect);
            }
            
            if (this._directionCircle) {
                // Owner と同期する
                this._directionCircle.position = this._owner.position;
                this._directionCircle.visible = this._owner.visible;
                this._directionCircle.opacity = this._owner.opacity * 0.5;
                this._directionCircleEffect!.position = this._owner.position;
                this._directionCircleEffect!.visible = this._owner.visible;
                this._directionCircleEffect!.opacity = this._owner.opacity;

                const v = this._easingAnimationCurve.evaluate(this._directionCircleAnimationCount);
                this._directionCircleEffect!.scale.x = 1.0 + v * 0.5;
                this._directionCircleEffect!.scale.y = 1.0 + v * 0.5;
                this._directionCircleEffect!.opacity = (1.0 - v) * 255;

                this._directionCircleAnimationCount++;
                if (this._directionCircleAnimationCount > CIRCLE_ANIMATION_FRAMES) {
                    this._directionCircleAnimationCount = 0;
                }
            }
        }

        const visual = this._owner.findVisual();
        const equipments = visual?.entity().findEntityBehavior(LEquipmentUserBehavior);
        if (visual && equipments) {
            if (this._revisionNumber != equipments.revisitonNumber()) {
                const items = equipments.equippedItemEntities();

                // 装備中のアイテムリストとスプライト情報の配列サイズを揃えておく
                while(this._sprites.length > items.length) {
                    this._sprites[this._sprites.length - 1].sprite?.destroy();
                    this._sprites.pop();
                }
                while(this._sprites.length < items.length) { 
                    this._sprites.push({
                        imageName: "",
                        sprite: undefined,
                        itemEntityDataId: 0,
                    });
                 }

                for (let i = 0; i < items.length; i++) {
                    const itemEntityData = items[i].data;
                    
                    const newImage = itemEntityData.entity.equipmentImage.name;
                    const current = (i < this._sprites.length) ? this._sprites[i].imageName : "";

                    const spriteData = this._sprites[i];
                    spriteData.itemEntityDataId = itemEntityData.id;

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

                // 追加処理。
                // 装備アイテムのイメージは Z-Offset を設定する必要があるため、CharacterSprite の子ではなく、その親に追加する。
                {
                    // 一度除外する
                    for (const s of this._sprites) {
                        if (s.sprite) this._parent.removeChild(s.sprite);
                    }
    
                    // 装備スロットIDの若い方が上に表示されるように追加する
                    for (const s of this._sprites.slice().reverse()) {
                        if (s.sprite) this._parent.addChild(s.sprite);
                    }
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

                    // Owner と同期する
                    s.sprite.position = this._owner.position;
                    s.sprite.visible = this._owner.visible;
                    s.sprite.opacity = this._owner.opacity;

                    if (MRData.entities[s.itemEntityDataId].entity.equipmentImage.side == DItemEquipmentSide.Right) {
                        s.sprite.z = this._owner.z + ZOFFSET_TABLE_RIGHT_HAND[d];
                    }
                    else {
                        s.sprite.z = this._owner.z + ZOFFSET_TABLE_LEFT_HAND[d];
                    }
                }
            }
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

