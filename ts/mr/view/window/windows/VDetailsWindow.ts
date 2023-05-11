import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";

export class VDetailsWindow extends Window_Base {
    private _dialog: SDetailsDialog;
    onClose: (() => void) | undefined;

    constructor(dialog: SDetailsDialog) {
        super(new Rectangle(0, 64, Graphics.boxWidth, 400));
        this._dialog = dialog;
        //this.openness = 0;  // 初期状態では非表示
        this.refresh();
    }
    
    private isOpenAndActive(): boolean {
        return this.isOpen() && this.visible && this.active;
    };

    update(): void {

        if (this.isOpenAndActive()) {
            if (this.isTriggered()) {
                this.close();
            }
        }
        super.update();
    }

    close(): void {
        if (this.onClose) {
            this.onClose();
        }
    }
        
    refresh(): void {
        const rect = this.baseTextRect();
        this.contents.clear();

        const lineHeight = this.lineHeight();
        let y = 0;
        this.drawTextEx(this._dialog.summary, 0, y, 300); y += lineHeight * 2;

        this.drawTextEx(this._dialog.description, 0, y, 300); y += lineHeight;
    }

    private isTriggered(): boolean {
        return (
            Input.isRepeated("ok") ||
            Input.isRepeated("cancel") ||
            TouchInput.isRepeated()
        );
    }
}

/*

export class VDetailsWindow extends VISelectableWindow {
    private _dialog: SDetailsDialog;
    onClose: (() => void) | undefined;

    constructor(dialog: SDetailsDialog) {
        super(new Rectangle(0, 64, Graphics.boxWidth, 400));
        this._dialog = dialog;
        //this.openness = 0;  // 初期状態では非表示
        this.refresh();
        this.padding = 20;
    }
    
    override isOpenAndActive(): boolean {
        return this.isOpen() && this.visible && this.active;
    }

    override maxItems(): number {
        return this._dialog.descriptions.length;
    }

    update(): void {

        if (this.isOpenAndActive()) {
            if (this.isTriggered()) {
                this.close();
            }
        }
        super.update();
    }

    close(): void {
        if (this.onClose) {
            this.onClose();
        }
    }
        
    refresh(): void {
        super.refresh();
        const rect = this.baseTextRect();
        this.contents.clear();

        const width = this.contents.width;
        const lineHeight = this.lineHeight();

        let y = 0;
        y += this.drawEntityName(0, y, width).height;

        y += lineHeight / 2;

        ColorManager.itemBackColor1()

        //this.drawRect()

        this.drawTextEx(this._dialog.description, 0, y, 300); y += lineHeight;
    }

    override drawItem(index: number): void {
        const item = this._dialog.description[index];
        if (item) {
            const rect = this.itemLineRect(index);
            this.drawTextEx(item, rect.x, rect.y, rect.width);
        }
    };

    private drawEntityName(x: number, y: number, width: number): VUISize {
        const rect = this.baseTextRect();
        const height = this.lineHeight();
        this.drawHeadingRect(x, y, width, height, false, true);
        this.drawTextEx(this._dialog.summary, rect.x, rect.y, width);
        return { width: rect.width, height: rect.height }
    }

    private drawHeadingRect(x: number, y: number, width: number, height: number, topline: boolean, bottomline: boolean): void {
        this.contents.fillRect(x, y, width, height, ColorManager.itemBackColor1());
        if (topline) {
            this.contents.fillRect(x, y, width, 1, this.underlineColor());
        }
        if (bottomline) {
            this.contents.fillRect(x, y + height - 1, width, 1, this.underlineColor());
        }
    }

    private underlineColor(): string {
        return ColorManager.systemColor();
    }

    private isTriggered(): boolean {
        return (
            Input.isRepeated("ok") ||
            Input.isRepeated("cancel") ||
            TouchInput.isRepeated()
        );
    }
}
*/
