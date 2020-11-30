


/**
 */
export class VMenuCommandWindow extends Window_Command {

    constructor(rect: Rectangle) {
        super(rect);
    }
    
    makeCommandList(): void {
        this.addCommand(TextManager.item, "item", true, undefined);
        this.addCommand("足元", "footing", true, undefined);
        this.addCommand("その他", "other", true, undefined);
    }
}

