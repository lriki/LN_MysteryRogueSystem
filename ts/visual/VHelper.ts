

export class VHelper {
    public static setIconFrame(sprite: Sprite, iconIndex: number): void {
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (iconIndex % 16) * pw;
        const sy = Math.floor(iconIndex / 16) * ph;
        sprite.setFrame(sx, sy, pw, ph);
    }

    // Game_CharacterBase.prototype.screenX
    public static toScreenX(x: number): number{
        const tw = $gameMap.tileWidth();
        const scrolledX = $gameMap.adjustX(x);
        return Math.floor(scrolledX * tw + tw / 2);
    }
    
    // Game_CharacterBase.prototype.screenY
    public static toScreenY(y: number) : number{
        const th = $gameMap.tileHeight();
        const scrolledY = $gameMap.adjustY(y);
        return Math.floor(scrolledY * th + th);
    }
}

