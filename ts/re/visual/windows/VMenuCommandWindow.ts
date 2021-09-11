import { REGame } from "ts/re/objects/REGame";
import { STextManager } from "ts/re/system/STextManager";



/**
 */
export class VMenuCommandWindow extends Window_Command {

    constructor(rect: Rectangle) {
        super(rect);
    }
    
    makeCommandList(): void {
        this.addCommand(TextManager.item, "item", true, undefined);
        this.addCommand("足元", "feet", true, undefined);
        this.addCommand("その他", "other", true, undefined);

        if (REGame.map.floorId().isSafety()) {
            this.addCommand(STextManager.save, "save", true, undefined);
        }
        else {
            this.addCommand("中断", "suspend", true, undefined);
        }
    }
}

