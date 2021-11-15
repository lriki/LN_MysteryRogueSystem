import { tr } from "ts/re/Common";



/**
 */
export class VWarehouseMenuCommandWindow extends Window_Command {

    constructor(rect: Rectangle) {
        super(rect);
    }
    
    makeCommandList(): void {
        this.addCommand(tr("あずける"), "store", true, undefined);
        this.addCommand(tr("ひきだす"), "withdraw", true, undefined);
        this.addCommand(tr("キャンセル"), "cancel", true, undefined);
    }
}

