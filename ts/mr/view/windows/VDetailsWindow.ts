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
