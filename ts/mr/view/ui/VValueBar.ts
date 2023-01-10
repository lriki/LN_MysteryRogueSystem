
export enum VValueVarType {
    LeftToRight = 0,
    BottomToTop = 1,
}

/**
 * 
 * 
 * レイアウトのイメージは次のようになる。
 * 
 * |----------------width------------------|
 * |                                       |
 * .........................................---
 * .                                       .  |
 * .  Label   Value                        .  height
 * +----------------------------------+    .  |
 * |  Bar                             |    .  |
 * +----------------------------------+.....---
 * 
 * - Bar は Bottom-Left で配置する。通常、Width は BarBackground-FrameWidth と同じにするべき。
 * 
 * 
 */
export class VValueVar extends PIXI.Container {
    private _type: VValueVarType;
    private _barBackground: Sprite;
    private _barForeground: Sprite;
    private _textSprite: Sprite;
    private _textBitmap: Bitmap;
    private _barForegroundFrameX: number;
    private _barForegroundFrameY: number;
    private _barForegroundFrameW: number;
    private _barForegroundFrameH: number;
    private _paddingX: number;
    private _paddingY: number;
    private _labelText: string;
    private _labelColor: string;
    private _valueColor: string;
    private _value: number;
    private _maxValue: number;
    private _overrideText: string | undefined;
    private _textPaddingX: number;
    private _needRefresh: boolean;

    public labelFontSize: number;
    public valueFontSize: number;

    _height: number;

    public constructor(type: VValueVarType, bitmap: Bitmap, width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
        this._height = height;
        this._type = type;
        this._textBitmap = new Bitmap(width, height);
        this._barBackground = new Sprite(bitmap);
        this._barForeground = new Sprite(bitmap);
        this._textSprite = new Sprite(this._textBitmap);
        this.addChild(this._barBackground);
        this.addChild(this._barForeground);
        this.addChild(this._textSprite);
        this._barForegroundFrameX = 0;
        this._barForegroundFrameY = 0;
        this._barForegroundFrameW = 0;
        this._barForegroundFrameH = 0;
        this._paddingX = 0;
        this._paddingY = 0;
        this._labelText = "Lv.";
        this._labelColor = ColorManager.textColor(23);
        this._valueColor = "#ffffff";
        this._value = 50;
        this._maxValue = 100;
        this._textPaddingX = 4;
        this._needRefresh = true;
        this.labelFontSize = $gameSystem.mainFontSize();
        this.valueFontSize = $gameSystem.mainFontSize();
    }

    public setBarBackgroundFrame(x: number, y: number, w: number, h: number): void {
        this._barBackground.setFrame(x, y, w, h);
        this._barBackground.width = w;
        this._barBackground.height = h;
    }

    public setBarForegroundFrame(x: number, y: number, w: number, h: number): void {
        this._barForeground.setFrame(x, y, w, h);
        this._barForeground.width = w;
        this._barForeground.height = h;
        this._barForegroundFrameX = x;
        this._barForegroundFrameY = y;
        this._barForegroundFrameW = w;
        this._barForegroundFrameH = h;
    }

    public setPadding(x: number, y: number): void {
        this._paddingX = x;
        this._paddingY = y;
    }

    public setLabel(text: string): void {
        this._labelText = text
    }

    public update(): void {
        if (this._needRefresh) {
            this.refresh();
        }

        this._barBackground.x = 0;
        this._barBackground.y = this._height - this._barBackground.height;
        this._barForeground.x = this._paddingX;
        this._barForeground.y = this._paddingY;


        if (this._type == VValueVarType.LeftToRight) {
            const ratio = this._value / this._maxValue;
            const width = Math.floor(this._barForegroundFrameW * ratio);
            this._barForeground.setFrame(this._barForegroundFrameX, this._barForegroundFrameY, width, this._barForegroundFrameH);
            this._textSprite.x = 0;
            this._textSprite.y = this._height - (this._barBackground.height / 2) - this._textBitmap.height;
        }
        else if (this._type == VValueVarType.BottomToTop) {
            const ratio = this._value / this._maxValue;
            const height = Math.floor(this._barForegroundFrameH * ratio);
            this._barForeground.setFrame(this._barForegroundFrameX, this._barForegroundFrameY + (this._barForegroundFrameH - height), this._barForegroundFrameW, height);
            this._barForeground.y = this._paddingY + (this._barForegroundFrameH - height);
        }

        this._barForeground.visible = false;
        // test
        // if (this._value > 0) {
        //     this._value -= 0.1;
        // }
    }

    private refresh(): void {
        const valueText = this.getValueText();

        this._textBitmap.clear();

        if (this._type == VValueVarType.LeftToRight) {
            const bitmapHeight = this._textBitmap.height;

            const width = this._textBitmap.width - (this._paddingX + this._textPaddingX) * 2;
            const x = this._textPaddingX;
            this._textBitmap.textColor = this._labelColor;
            this._textBitmap.fontSize = this.labelFontSize;
            const [labelWidth, labelHeight] = this.getTextSize(this._textBitmap, this._labelText);
            this._textBitmap.drawText(this._labelText, x, bitmapHeight - labelHeight, width, labelHeight, "left");

            this._textBitmap.textColor = this._valueColor;
            this._textBitmap.fontSize = this.valueFontSize;
            const [valueWidth, valueHeight] = this.getTextSize(this._textBitmap, this._labelText);
            this._textBitmap.drawText(valueText, x, bitmapHeight - valueHeight, width, valueHeight, "right");
        }
        else if (this._type == VValueVarType.BottomToTop) {
            const width = this._textBitmap.measureTextWidth(this._labelText + valueText);
            const x = (this.width - width) / 2;
            this._textBitmap.textColor = this._labelColor;
            this._textBitmap.fontSize = this.labelFontSize;
            this._textBitmap.drawText(this._labelText, x, 0, width, this._textBitmap.height, "left");
            this._textBitmap.textColor = this._valueColor;
            this._textBitmap.fontSize = this.valueFontSize;
            this._textBitmap.drawText(valueText, x, 0, width, this._textBitmap.height, "right");
        }

        this._needRefresh = false;
    }

    private getValueText(): string {
        if (this._overrideText) {
            return this._overrideText;
        }
        return "9999/9999"
        return this._value.toString();
    }

    // .fontSize 設定済みであること
    public getTextSize(bitmap: Bitmap, text: string, fontSize?: number): [number, number] {
        const context = bitmap.context;
        context.save();
        context.font = (bitmap as any)._makeFontNameText();
        if (fontSize !== undefined) {
            this._textBitmap.fontSize = fontSize;
        }
        const metrics = context.measureText(text);
        context.restore();
        const height =  metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const ow =  bitmap.outlineWidth ?? 0;
        return [Math.ceil(metrics.width + ow), Math.ceil(height + ow)];
    }
}
