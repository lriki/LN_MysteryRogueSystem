import { assert } from "../Common";
import { VFloatingAnimationTargetSprite } from "../view/sprites/VFloatingAnimationSprite";

declare global {
    interface Spriteset_Base {
        _mrFloatingAnimationSprites: VFloatingAnimationTargetSprite[];

        //initialize(): void;
        createMRFloatingAnimationSprite(animation: IDataAnimation, x: number, y: number): void;
    }
}

Spriteset_Base.prototype.createMRFloatingAnimationSprite = function(animation: IDataAnimation, x: number, y: number): void {
    const mv = this.isMVAnimation(animation);
    const sprite = new (mv ? Sprite_AnimationMV : Sprite_Animation)(undefined);

    const targetSprite = new VFloatingAnimationTargetSprite(undefined);
    targetSprite.animationSprite = sprite;
    const targetSprites = [targetSprite];
    for (const s of targetSprites) {
        s.x = x;
        s.y = y;
        this._effectsContainer.addChild(s);
    }

    sprite.setup(targetSprites, animation, false, 0, null);
    sprite.targetObjects = [];  // これには本来、 Game_Character または Game_Battler を格納する。でも FloatingAnimation は Game_Character に紐付かないので、空配列を自分で作っておく。

    this._effectsContainer.addChild(sprite);
    this._animationSprites.push(sprite);
    this._mrFloatingAnimationSprites.push(targetSprite);
};

const _Spriteset_Base_initialize = Spriteset_Base.prototype.initialize;
Spriteset_Base.prototype.initialize = function(): void {
    _Spriteset_Base_initialize.call(this);
    this._mrFloatingAnimationSprites = [];
}

const _Spriteset_Base_removeAnimation = Spriteset_Base.prototype.removeAnimation;
Spriteset_Base.prototype.removeAnimation = function(sprite): void {

    _Spriteset_Base_removeAnimation.call(this, sprite);

    // Destroy VFloatingAnimationTargetSprite
    for (let i = this._mrFloatingAnimationSprites.length - 1; i >= 0; i--) {
        const targetSprite = this._mrFloatingAnimationSprites[i];
        if (targetSprite.animationSprite == sprite) {
            this._effectsContainer.removeChild(targetSprite);
            this._mrFloatingAnimationSprites.splice(i, 1);
            targetSprite.destroy();
        }
    }
}
