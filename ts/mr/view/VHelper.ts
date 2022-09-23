

export class VHelper {
    public static setIconFrame(sprite: Sprite, iconIndex: number): void {
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (iconIndex % 16) * pw;
        const sy = Math.floor(iconIndex / 16) * ph;
        sprite.setFrame(sx, sy, pw, ph);
    }

    // Game_CharacterBase.prototype.screenX
    // ※タイルの中央
    public static toScreenX(mx: number): number{
        const tw = $gameMap.tileWidth();
        const scrolledX = $gameMap.adjustX(mx);
        return Math.floor(scrolledX * tw + tw / 2);
    }
    
    // Game_CharacterBase.prototype.screenY
    // ※タイルの下端
    public static toScreenY(my: number, center: boolean = false) : number{
        const th = $gameMap.tileHeight();
        const scrolledY = $gameMap.adjustY(my);
        if (center)
            return Math.floor(scrolledY * th + th / 2);
        else
            return Math.floor(scrolledY * th + th);
    }
}

