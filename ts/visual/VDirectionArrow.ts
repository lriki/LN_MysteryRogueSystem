import { REGame } from "ts/objects/REGame";
import { REVisual } from "./REVisual";

export class VDirectionArrow extends Sprite {
    private _sprites: Sprite[];
    private _bitmap: Bitmap;
    private _x = 100;
    private _y = 100;
    private _dir = 0;
    private _crossDiagonal: boolean = false;

    public constructor() {
        super(undefined);

        this._bitmap = ImageManager.loadSystem("RE-DirectionArrow");

        this._sprites = [
            new Sprite(this._bitmap), new Sprite(this._bitmap), new Sprite(this._bitmap),
            new Sprite(this._bitmap), new Sprite(this._bitmap), new Sprite(this._bitmap),
            new Sprite(this._bitmap), new Sprite(this._bitmap), new Sprite(this._bitmap),
        ];

        const parent = this;
        this._sprites.forEach((s, i) => {
            parent.addChild(s);
        });
    }

    private setPosition(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public setDirection(d: number) {
        this._dir = d;
    }

    public setCrossDiagonal(d: boolean) {
        this._crossDiagonal = d;
    }

    // override
    update(): void {
        
        if ($gameMap.isRESystemMap()) {
            this.visible = true;
        }
        else {
            this.visible = false;
            return;
        }

        const entity = REGame.camera.focusedEntity();
        if (entity && REVisual.entityVisualSet) {
            const sprite = REVisual.entityVisualSet.getEntityVisualByEntity(entity).getRmmzSprite();
            this.setPosition(sprite.x, sprite.y);
        }


        const size = this._bitmap.width;
        this._sprites.forEach((s, i) => {
            s.setFrame(0, i * size, size, size);
        });

        const ox = -(size / 2);
        const oy = -size;

        this._sprites[0].x = ox + this._x - size;
        this._sprites[0].y = oy + this._y + size;
        this._sprites[1].x = ox + this._x;
        this._sprites[1].y = oy + this._y + size;
        this._sprites[2].x = ox + this._x + size;
        this._sprites[2].y = oy + this._y + size;
        
        this._sprites[3].x = ox + this._x - size;
        this._sprites[3].y = oy + this._y;
        this._sprites[4].x = ox + this._x;
        this._sprites[4].y = oy + this._y;
        this._sprites[5].x = ox + this._x + size;
        this._sprites[5].y = oy + this._y;

        this._sprites[6].x = ox + this._x - size;
        this._sprites[6].y = oy + this._y - size;
        this._sprites[7].x = ox + this._x;
        this._sprites[7].y = oy + this._y - size;
        this._sprites[8].x = ox + this._x + size;
        this._sprites[8].y = oy + this._y - size;

        if (this._crossDiagonal) {
            this._sprites[1].visible = this._sprites[3].visible = this._sprites[5].visible = this._sprites[7].visible = false;
            this._sprites[0].visible = this._sprites[2].visible = this._sprites[6].visible = this._sprites[8].visible = true;
        }
        else {
            for (let i = 0; i < this._sprites.length; i++) {
                this._sprites[i].visible = (this._dir - 1 == i);
            }
        }
    }
}
