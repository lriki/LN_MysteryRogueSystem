import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";

export class VWindowHelper {
    public static DefaultPadding = 12;
    public static LineHeight = 36;  // Window_Base.prototype.lineHeight

    public static calcWindowSizeFromClinetSize(width: number, height: number): number[] {
        //const pad = this.calcOuterPadding(window);
        return [width + this.DefaultPadding * 2, height + this.DefaultPadding * 2];
    }

    public static calcOuterPadding(window: Window_Base): number[] {
        const pad = window.padding;
        return [
            pad - window.origin.x,
            pad - window.origin.y];
    }
    
    public static drawEntityItemName(window: Window_Base, item: LEntity, x: number, y: number, width: number, equipmentUser: LEquipmentUserBehavior | undefined): void {
        if (item) {
            const iconY = y + (window.lineHeight() - ImageManager.iconHeight) / 2;
            const nameX = x + ImageManager.iconWidth;
            const desc = UName.makeNameAsItem(item);

            // State Icon
            {
            }

            // Item Icon
            // Name
            {
                const textMargin = ImageManager.iconWidth * 2 + 4;

                const itemWidth = Math.max(0, width - textMargin);
                window.resetTextColor();

                window.drawTextEx(desc, nameX, y, itemWidth);

                // 装備していればアイコンを表示する
                if (equipmentUser && equipmentUser.isEquipped(item)) {
                    window.drawIcon(12, nameX, iconY);
                }
            }

            // 値札
            const itemBehavior = item.findEntityBehavior(LItemBehavior);
            if (itemBehavior && itemBehavior.shopStructureId() > 0) {
                const data = item.data();
                const text = data.sellingPrice.toString();
                const tw = window.textWidth(text) + 8;
                const size = window.textSizeEx(text);
                const th = size.height - 4;
                const ty = y + (window.lineHeight() - th) / 2;
                const tx = width - tw + 4;
                window.changeTextColor(ColorManager.textColor(29));
                window.drawRect(tx, ty, tw, th);
                window.drawTextEx(text, width - tw, ty, tw);
            }
        }
    }
}


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

export interface VUIPoint {
    x: number;
    y: number;
}

export interface VUISize {
    width: number;
    height: number;
}

export interface VUIRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface VUIThickness {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class VUIElement {
    private _margin: VUIThickness;
    private _padding: VUIThickness;
    private _desiredWidth: number;
    private _desiredHeight: number;
    private _actualRect: VUIRect;
    // private _actualWidth: number;
    // private _actualHeight: number;

    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;

    x: number;
    y: number;

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
        const rect = this.actualRect();
        if (this._color) {
            context.changeTextColor(this._color);
        }
        else {
            context.resetTextColor();
        }
        //context.contents.paintOpacity = 100;
        context.drawText(this._text, rect.x, rect.y, rect.width, "left");
        //context.drawTextEx(this._text, rect.x, rect.y, rect.width);
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



enum VUIGridLayoutLengthType
{
	/** 子要素のサイズに合わせる */
	Auto,

	/** サイズを直接指定する */
	Direct,

	/** レイアウト後、残りの領域を使う */
	Ratio,
};

enum VUIGridLayoutRule
{
	Box,
	VerticalFlow,

	// 子要素を上詰めで配置する。
	// Row は Auto となり、Height 0 の Item は表示されない。
	HorizontalFlow,
};

class VUIGridLayoutDefinitionData
{
    // input data
    type: VUIGridLayoutLengthType = VUIGridLayoutLengthType.Auto;
    size: number = 0;
    minSize: number = 0;
    maxSize: number = 100000;

    // working data
    desiredSize: number = 0;
    actualOffset: number = 0;	// 最終オフセット
    actualSize: number = 0;		// 最終サイズ

    public constructor(type: VUIGridLayoutLengthType ) {
        this.type = type;
    }

    getAvailableDesiredSize(): number {
        if (this.type == VUIGridLayoutLengthType.Auto) {
            return this.desiredSize;
        }
        else if (this.type == VUIGridLayoutLengthType.Direct) {
            return VLayout.clamp(this.size, this.minSize, this.maxSize);
        }
        else {
            return this.desiredSize;
        }
    }

    GetRatioSize(): number
    {
        return (this.size == 0) ? 1 : this.size;
    }

    AdjustActualSize(): void
    {
        this.actualSize = VLayout.clamp(this.actualSize, this.minSize, this.maxSize);
    }
};


export class VUIGridLayout extends VUIContainer {
    m_rowDefinitions: VUIGridLayoutDefinitionData[];
    m_columnDefinitions: VUIGridLayoutDefinitionData[];
	m_rule = VUIGridLayoutRule.VerticalFlow;

    public constructor() {
        super();
        this.m_rowDefinitions = [];
        this.m_columnDefinitions = [];
    }

    
    private GetDefaultRowLengthType(): VUIGridLayoutLengthType
    {
        if (this.m_rule == VUIGridLayoutRule.VerticalFlow)
            return VUIGridLayoutLengthType.Auto;
        else
            return VUIGridLayoutLengthType.Ratio;
    }

    private GetDefaultColumnLengthType(): VUIGridLayoutLengthType
    {
        if (this.m_rule == VUIGridLayoutRule.HorizontalFlow)
            return VUIGridLayoutLengthType.Auto;
        else
            return VUIGridLayoutLengthType.Ratio;
    }

    private PrepareDefinitions(rowCount: number, colCount: number)
    {
        while (this.m_rowDefinitions.length < rowCount) {
            this.m_rowDefinitions.push(new VUIGridLayoutDefinitionData(this.GetDefaultRowLengthType()));
        }
        while (this.m_columnDefinitions.length < colCount) {
            this.m_columnDefinitions.push(new VUIGridLayoutDefinitionData(this.GetDefaultColumnLengthType()));
        }
    }

    public measure(context: Window_Base): void {

        // Measure layout and grid size.
        const children = this.children();
        let rowCount = 0;
        let colCount = 0;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.measure(context);

            rowCount = Math.max(rowCount, child.row + 1);
            colCount = Math.max(colCount, child.col + 1);
        }

        // Allocate definitions
        this.PrepareDefinitions(rowCount, colCount);

        // Measure desired sizes per cells.
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            const row = this.m_rowDefinitions[child.row];
            const col = this.m_columnDefinitions[child.col];

            //const childDesiredSize = child->desiredSize;
            if (row.type == VUIGridLayoutLengthType.Auto || row.type == VUIGridLayoutLengthType.Ratio) {
                row.desiredSize = Math.max(row.desiredSize, child.desiredHeight());
            }
            if (col.type == VUIGridLayoutLengthType.Auto || row.type == VUIGridLayoutLengthType.Ratio) {
                col.desiredSize = Math.max(col.desiredSize, child.desiredWidth());
            }
        }

        // Aggregate DesiredSize of each cell to find DesiredSize of entire Grid
        let cellsDesiredWidth = 0;
        let cellsDesiredHeight = 0;
        for (const row of this.m_rowDefinitions) {
            cellsDesiredHeight += row.getAvailableDesiredSize();
        }
        for (const col of this.m_columnDefinitions) {
            cellsDesiredWidth += col.getAvailableDesiredSize();
        }

        this.setDesiredSize(cellsDesiredWidth, cellsDesiredHeight);
    }

    public arrange(finalArea: VUIRect): VUIRect
    {
        //const auto finalWidth = finalArea.Size();
        //const dtx::Thickness padding(0);
        const margin = this.getMargin();    // TODO: ほんとは arrange の外側でやるべき
        finalArea.x += margin.left;
        finalArea.y += margin.top;
        finalArea.width -= margin.left + margin.right;
        finalArea.height -= margin.top + margin.bottom;

        const padding = this.padding();
        const childrenBoundSize: VUISize = {width: finalArea.width - (padding.left + padding.right), height: finalArea.height - (padding.top + padding.bottom)};

        // Fix final size of 'Auto' and 'Direct', and count 'Ratio'
        const totalActualSize: VUISize = { width: 0, height: 0 };
        let ratioRowCount = 0;
        let ratioColCount = 0;
        for (const row of this.m_rowDefinitions) {
            if (row.type == VUIGridLayoutLengthType.Auto || row.type == VUIGridLayoutLengthType.Direct) {
                row.actualSize = row.getAvailableDesiredSize();
                totalActualSize.height += row.actualSize;
            }
            else {
                ratioRowCount += row.GetRatioSize();
            }
        }
        for (const col of this.m_columnDefinitions) {
            if (col.type == VUIGridLayoutLengthType.Auto || col.type == VUIGridLayoutLengthType.Direct) {
                col.actualSize = col.getAvailableDesiredSize();
                totalActualSize.width += col.actualSize;
            }
            else {
                ratioColCount += col.GetRatioSize();
            }
        }

        // "1*" 分のセルの領域を計算する
        const ratioUnit: VUISize = {
            width: (ratioColCount != 0) ? (childrenBoundSize.width - totalActualSize.width) / ratioColCount : 0,
            height: (ratioRowCount != 0) ? (childrenBoundSize.height - totalActualSize.height) / ratioRowCount : 0};
        ratioUnit.width = Math.max(0, ratioUnit.width);
        ratioUnit.height = Math.max(0, ratioUnit.height);

        // "*" 指定である Row/Column の最終サイズを確定させ、
        // 全セルのオフセット (位置) も確定させる
        const totalOffset: VUIPoint = { x: 0, y: 0 };
        for (const row of this.m_rowDefinitions) {
            if (row.type == VUIGridLayoutLengthType.Ratio) {
                row.actualSize = ratioUnit.height * row.GetRatioSize();
            }
            row.AdjustActualSize();

            // Fix cell offset
            row.actualOffset = totalOffset.y;
            totalOffset.y += row.actualSize;
        }
        for (const col of this.m_columnDefinitions) {
            if (col.type == VUIGridLayoutLengthType.Ratio) {
                col.actualSize = ratioUnit.width * col.GetRatioSize();
            }
            col.AdjustActualSize();

            // Fix cell offset
            col.actualOffset = totalOffset.x;
            totalOffset.x += col.actualSize;
        }

        // 子要素の最終位置・サイズを確定させる
        let resultRect: VUIRect = { x: 0, y: 0, width: 0, height: 0 };
        const rowDefCount = (this.m_rowDefinitions.length);
        const colDefCount = (this.m_columnDefinitions.length);
        const children = this.children();
        for (let iChild = 0; iChild < children.length; iChild++) {
            const child = children[iChild];
            const rowIdx = child.row;
            const colIdx = child.col;
            let rowSpan = child.rowSpan;
            let colSpan = child.colSpan;
            rowSpan = Math.max(1, rowSpan);	// 最低 1
            colSpan = Math.max(1, colSpan);	// 最低 1
            rowSpan = Math.min(rowSpan, rowIdx + rowDefCount);	// 最大値制限
            colSpan = Math.min(colSpan, colIdx + colDefCount);	// 最大値制限

            // Span を考慮してサイズを確定
            const rect: VUIRect = {x: padding.left, y: padding.top, width: 0, height: 0};
            {
                rect.y += this.m_rowDefinitions[rowIdx].actualOffset;
                for (let iRow = 0; iRow < rowSpan; iRow++) {
                    rect.height += this.m_rowDefinitions[rowIdx + iRow].actualSize;
                }
            }
            {
                rect.x += this.m_columnDefinitions[colIdx].actualOffset;
                for (let iCol = 0; iCol < colSpan; iCol++) {
                    rect.width += this.m_columnDefinitions[colIdx + iCol].actualSize;
                }
            }

            // Arrange
            const cr = VLayout.makeOffset(rect, finalArea.x, finalArea.y);
            //ArrangeItem(child, cr);
            child.arrange(cr);

            resultRect = VLayout.inflateIncludes(resultRect, cr);
        }

        return resultRect;
    }
}
