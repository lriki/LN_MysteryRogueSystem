import { VUIPoint, VUIRect, VUISize, VUIThickness } from "./VUICommon";


export class VLayout {

    public static makeGridRect(gx: number, gy: number, gw: number, gh: number) {
        return new Rectangle(this.calcGridX(gx), this.calcGridY(gy), this.calcGridWidth(gw), this.calcGridHeight(gh));
    }
    
    public static calcGridWidth(xs: number): number {
        return xs * (Graphics.boxWidth / 12);
    }
    public static calcGridHeight(xs: number): number {
        return xs * (Graphics.boxHeight / 12);
    }

    public static calcGridX(xs: number): number {
        return xs * (Graphics.boxWidth / 12);
    }

    public static calcGridY(xs: number): number {
        return xs * (Graphics.boxHeight / 12);
    }

    public static clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    };

    
	public static makeOffset(rect: VUIRect, x_: number, y_: number): VUIRect {
		return {x: rect.x + x_, y: rect.y + y_, width: rect.width, height: rect.height};
	}
    /** 指定した矩形が収まるようにこの矩形を拡張します。 */
	public static inflateIncludes(self: VUIRect, rect: VUIRect): VUIRect {
		if (self.width == 0 && self.height == 0) {
			return rect;
		}
		else {
            const result: VUIRect = { x: 0, y: 0, width: 0, height: 0 };
			let dx1 = self.x;
			let dy1 = self.y;
			let dx2 = self.x + self.width;
			let dy2 = self.y + self.height;
			const sx1 = rect.x;
			const sy1 = rect.y;
			const sx2 = rect.x + rect.width;
			const sy2 = rect.y + rect.height;
			dx1 = Math.min(dx1, sx1);
			dy1 = Math.min(dy1, sy1);
			dx2 = Math.max(dx2, sx2);
			dy2 = Math.max(dy2, sy2);
			result.x = dx1;
			result.y = dy1;
			result.width = dx2 - dx1;
			result.height = dy2 - dy1;
            return result;
		}
	}
}


export class VUIElement {
    private _margin: VUIThickness;
    private _padding: VUIThickness;
    private _desiredWidth: number;
    private _desiredHeight: number;
    private _actualRect: VUIRect;   // margin は含まない
    // private _actualWidth: number;
    // private _actualHeight: number;

    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;

    x: number;
    y: number;
    opacity: number;    // 0~1.0

    

    public constructor() {
        this._margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        };
        this._padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        };
        this._desiredWidth = 0;
        this._desiredHeight = 0;
        this._actualRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        // this._actualWidth = 0;
        // this._actualHeight = 0;
        this.row = 0;
        this.col = 0;
        this.rowSpan = 1;
        this.colSpan = 1;
        this.x = 0;
        this.y = 0;
        this.opacity = 1.0;
    }

    protected calcContentOuter(): VUIThickness {
        return {
            top: this._margin.top + this._padding.top,
            right: this._margin.right + this._padding.right,
            bottom: this._margin.bottom + this._padding.bottom,
            left: this._margin.left + this._padding.left,
        };
    }

    public margin(top: number, right?: number, bottom?: number, left?: number): this {
        if (right !== undefined && bottom !== undefined && left !== undefined) {
            this._margin.top = top;
            this._margin.right = right;
            this._margin.bottom = bottom;
            this._margin.left = left;
        }
        else if (right !== undefined) {
            this._margin.top = this._margin.bottom = top;
            this._margin.right = this._margin.left = right;
        }
        else {
            this._margin.top = this._margin.bottom = this._margin.right = this._margin.left = top;
        }
        return this;
    }

    public getMargin(): VUIThickness {
        return this._margin;
    }

    public padding(): VUIThickness {
        return this._padding;
    }

    public setGrid(col: number, row: number, colSpan: number = 1, rowSpan: number = 1): this {
        this.row = row;
        this.col = col;
        this.rowSpan = rowSpan;
        this.colSpan = colSpan;
        return this;
    }

    public setOpacity(value: number): this {
        this.opacity = value;
        return this;
    }

    public addTo(container: VUIContainer): this {
        container.addChild(this);
        return this;
    }

    protected setDesiredSize(width: number, height: number): void {
        this._desiredWidth = width;
        this._desiredHeight = height;
    }

    public desiredWidth(): number {
        return this._desiredWidth;
    }

    public desiredHeight(): number {
        return this._desiredHeight;
    }

    public measure(context: Window_Base): void {
    }

    public arrange(finalArea: VUIRect): VUIRect {
        const rect: VUIRect = {
            x: finalArea.x + this._margin.left,
            y: finalArea.y + this._margin.top,
            width: finalArea.width - this._margin.left - this._margin.right,
            height: finalArea.height - this._margin.top - this._margin.bottom};
        return this.arrangeOverride(rect);
    }

    protected arrangeOverride(finalArea: VUIRect): VUIRect {
        this.setActualRect(finalArea);
        return finalArea;
    }

    protected setActualRect(rect: VUIRect): void {
        this._actualRect = {...rect};
        this._actualRect.x += this.x;
        this._actualRect.y += this.y;
    }

    public actualRect(): VUIRect{
        return this._actualRect;
    }

    // public actualWidth(): number {
    //     return this._actualWidth;
    // }

    // public actualHeight(): number {
    //     return this._actualHeight;
    // }
    
    public draw(context: Window_Base): void {
        
    }
}

export class VUITextElement extends VUIElement {
    private _text: string;
    private _color: string | undefined;
    
    public constructor(text: string) {
        super();
        this._text = text;
    }

    public setText(value: string): this {
        this._text = value;
        return this;
    }

    public setColor(value: string): this {
        this._color = value;
        return this;
    }

    public measure(context: Window_Base): void {
        const size = context.textSizeEx(this._text);
        const outer = this.calcContentOuter();
        this.setDesiredSize(size.width + outer.left + outer.right, size.height + outer.top + outer.bottom);
    }

    public draw(context: Window_Base): void {
        if (this.opacity > 0.0) {
            const rect = this.actualRect();
            if (this._color) {
                context.changeTextColor(this._color);
            }
            else {
                context.resetTextColor();
            }

            context.contents.paintOpacity = this.opacity * 255;
            context.drawText(this._text, rect.x, rect.y, rect.width, "left");
            //context.drawTextEx(this._text, rect.x, rect.y, rect.width);
        }
    }
}


export class VUIContainer extends VUIElement {
    private _children: VUIElement[];

    public constructor() {
        super();
        this._children = [];
    }

    public addChild(element: VUIElement): VUIElement {
        this._children.push(element);
        return element;
    }

    public children(): readonly VUIElement[] {
        return this._children;
    }

    public draw(context: Window_Base): void {
        for (const child of this._children) {
            child.draw(context);
        }
    }
}


