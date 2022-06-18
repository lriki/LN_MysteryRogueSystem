import { DTextManager } from "ts/mr/data/DTextManager";
import { REGame } from "ts/mr/objects/REGame";



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

        if (REGame.map.floorId().isSafetyMap()) {
            this.addCommand(DTextManager.save, "save", true, undefined);
        }
        else {
            this.addCommand("中断", "suspend", true, undefined);
        }
    }
}

