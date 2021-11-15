
export class Sprite_CharacterDamage_RE extends Sprite_Damage {

    public setupCharacter(character: Game_CharacterBase) {
        var damageInfo   = character.shiftDamageInfo_RE();
        // this._toneColor  = [0, 0,0, 0];//$gameSystem.getPopupDamageTone();
        // this._mirror     = damageInfo.mirror;
        // this._damageInfo = damageInfo;
        // this._digit      = 0;
        // if (this.isMiss()) {
        //     this.createMissForCharacter();
        // } else {
            this.createDigits(damageInfo.value);
        // }
        // if (damageInfo.critical) {
        //     this.setupCriticalEffect();
        // }
    }

    updateChild(sprite: Sprite) {

        sprite.y = -this.easeOutExpo(90 - this._duration, 0, 50, 90);
        /*
        sprite.dy += 0.5;
        sprite.ry += sprite.dy;
        if (sprite.ry >= 0) {
            sprite.ry = 0;
            sprite.dy *= -0.6;
        }
        sprite.y = Math.round(sprite.ry);
        sprite.setBlendColor(this._flashColor);
        */
    }
    
    private easeOutExpo(t: number, b: number, c: number, d: number) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
     }
}

