import { assert } from "ts/mr/Common";

export class VTextImage extends Sprite {
    private _label: string;
    private _labelColor: string;
    private _labelFontSize: number;
    private _labelMarginLeft: number;
    private _labelMarginTop: number;
    private _labelMarginRight: number;
    private _labelAligntment: string;
    private _text: string;
    private _textColor: string;
    private _textFontSize: number;
    private _textMarginLeft: number;
    private _textMarginTop: number;
    private _textMarginRight: number;
    private _textAligntment: string;
    private _textBitmap: Bitmap | undefined;
    private _textSprite: Sprite;
    private _needRefresh: boolean;

    public constructor(bitmap: Bitmap) {
        super(bitmap);
        this._label = "";
        this._labelColor = this.getDefaultLabelColor();
        this._labelFontSize = this.getDefaultLabelFontSize();
        this._labelMarginLeft = 0;
        this._labelMarginTop = 0;
        this._labelMarginRight = 0;
        this._labelAligntment = "left";
        this._text = "";
        this._textColor = ColorManager.textColor(0);
        this._textFontSize = this.getDefaultValueFontSize();
        this._textMarginLeft = 0;
        this._textMarginTop = 0;
        this._textMarginRight = 0;
        this._textAligntment = "left";
        this._textSprite = new Sprite(undefined);
        this.addChild(this._textSprite);
        this._needRefresh = true;
    }

    public set label(value: string) {
        if (this._label !== value) {
            this._label = value;
            this._needRefresh = true;
        }
    }

    public set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this._needRefresh = true;
        }
    }

    public set labelFontSize(value: number) {
        if (this._labelFontSize !== value) {
            this._labelFontSize = value;
            this._needRefresh = true;
        }
    }

    public set labelMarginLeft(value: number) {
        if (this._labelMarginLeft !== value) {
            this._labelMarginLeft = value;
            this._needRefresh = true;
        }
    }

    public set labelMarginTop(value: number) {
        if (this._labelMarginTop !== value) {
            this._labelMarginTop = value;
            this._needRefresh = true;
        }
    }

    public set labelMarginRight(value: number) {
        if (this._labelMarginRight !== value) {
            this._labelMarginRight = value;
            this._needRefresh = true;
        }
    }

    public set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this._needRefresh = true;
        }
    }

    public set textColor(value: string) {
        if (this._textColor !== value) {
            this._textColor = value;
            this._needRefresh = true;
        }
    }

    public set textFontSize(value: number) {
        if (this._textFontSize !== value) {
            this._textFontSize = value;
            this._needRefresh = true;
        }
    }

    public set textMarginLeft(value: number) {
        if (this._textMarginLeft !== value) {
            this._textMarginLeft = value;
            this._needRefresh = true;
        }
    }

    public set textMarginTop(value: number) {
        if (this._textMarginTop !== value) {
            this._textMarginTop = value;
            this._needRefresh = true;
        }
    }

    public set textMarginRight(value: number) {
        if (this._textMarginRight !== value) {
            this._textMarginRight = value;
            this._needRefresh = true;
        }
    }

    public set textAligntment(value: string) {
        if (this._textAligntment !== value) {
            this._textAligntment = value;
            this._needRefresh = true;
        }
    }

    override update(): void {
        if (this._needRefresh) {
            this.refresh();
        }
        super.update();
    }

    private refresh(): void {
        const width = this._frame.width;
        const height = this._frame.height;

        if (!this._textBitmap || this._textBitmap.width !== width || this._textBitmap.height !== height) {
            this._textBitmap = new Bitmap(width, height);
            this._textSprite.bitmap = this._textBitmap;
        }

        assert(this._textBitmap);
        assert(this._textSprite);

        this._textBitmap.clear();

        if (this._label !== "") {
            this.setupLabelFont(this._textBitmap);
            this._textBitmap.drawText(
                this._label,
                this._labelMarginLeft,
                this._labelMarginTop,
                width - this._labelMarginLeft - this._labelMarginRight,
                this._labelFontSize,
                this._labelAligntment);
        }

        if (this._text !== "") {
            this.setupValueFont(this._textBitmap);
            this._textBitmap.drawText(
                this._text,
                this._textMarginLeft,
                this._textMarginTop,
                width - this._textMarginLeft - this._textMarginRight,
                this._textFontSize,
                this._textAligntment);
        }

        this._needRefresh = false;
    }
    
    private setupLabelFont(bitmap: Bitmap): void {
        bitmap.fontFace = this.getDefaultLabelFontFace();
        bitmap.fontSize = this._labelFontSize;
        bitmap.textColor = this._labelColor;
        bitmap.outlineColor = this.labelOutlineColor();
        bitmap.outlineWidth = this.labelOutlineWidth();
    };

    private setupValueFont(bitmap: Bitmap): void {
        bitmap.fontFace = this.getDefaultValueFontFace();
        bitmap.fontSize = this._textFontSize;
        bitmap.textColor = this._textColor;
        bitmap.outlineColor = this.valueOutlineColor();
        bitmap.outlineWidth = this.valueOutlineWidth();
    };

    // Sprite_Gauge.labelFontFace
    private getDefaultLabelFontFace(): string {
        return $gameSystem.mainFontFace();
    };

    // Sprite_Gauge.labelFontFace
    private getDefaultLabelFontSize(): number {
        return $gameSystem.mainFontSize() - 2;
    };

    // Sprite_Gauge.labelColor
    private getDefaultLabelColor = function() {
        return ColorManager.systemColor();
    };
    
    // Sprite_Gauge.labelOutlineColor
    private labelOutlineColor = function() {
        return ColorManager.outlineColor();
    };
    
    // Sprite_Gauge.labelOutlineWidth
    private labelOutlineWidth = function() {
        return 3;
    };

    // Sprite_Gauge.numberFontFace
    private getDefaultValueFontFace = function() {
        return $gameSystem.numberFontFace();
    };

    // Sprite_Gauge.valueFontSize
    private getDefaultValueFontSize = function() {
        return $gameSystem.mainFontSize() - 6;
    };

    private valueOutlineColor = function() {
        return "rgba(0, 0, 0, 1)";
    };
    
    private valueOutlineWidth = function() {
        return 2;
    };
}
