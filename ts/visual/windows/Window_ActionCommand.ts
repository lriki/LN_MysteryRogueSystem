
/**
 * [足元]
 */
export class Window_ActionCommand extends Window_Command {

    constructor(rect: Rectangle) {
        super(rect);
        //this.openness = 0;
    };
    
    makeCommandList(): void {
        super.makeCommandList();
        this.addCommand("？？？", "newGame", true, undefined);
        this.addCommand("説明", "continue", true, undefined);
    };
    
    processOk(): void {
        super.processOk();
    };
}

