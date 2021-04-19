

const lineHeight = 36;  // Window_Base.prototype.lineHeight

export class VHudSpriteSet extends Sprite {
    private _floorNumberBitmap: Bitmap;
    private _floorNumberSprite: Sprite;

    constructor() {
        super(undefined);

        this._floorNumberBitmap = new Bitmap(64, 64);
        this._floorNumberBitmap.drawText("1F", 0, 0, 64, lineHeight, "left");
        this._floorNumberSprite = new Sprite(this._floorNumberBitmap);
        this.addChild(this._floorNumberSprite);
    }
}
