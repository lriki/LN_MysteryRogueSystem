
/**
 */
export class Window_Location extends Window_Command {
    _text: string;

    constructor(rect: Rectangle) {
        super(rect);
        this._text = "test";
        this.refresh();
    };
        
    refresh(): void {
        const rect = this.baseTextRect();
        this.contents.clear();
        this.drawTextEx(this._text, rect.x, rect.y, rect.width);
    };

}

