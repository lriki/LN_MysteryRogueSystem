
export class VFloatingAnimationTargetSprite extends Sprite {
    
    public animationSprite: Sprite_AnimationMV | Sprite_Animation | undefined;

    public get isPlaying(): boolean {
        return this.animationSprite ? this.animationSprite.isPlaying() : false;
    }

}

