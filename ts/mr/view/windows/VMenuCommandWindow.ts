import { tr2 } from "ts/mr/Common";
import { DTextManager } from "ts/mr/data/DTextManager";
import { MRLively } from "ts/mr/lively/MRLively";
import { paramSuspendMenuEnabled } from "ts/mr/PluginParameters";



/**
 */
export class VMenuCommandWindow extends Window_Command {

    constructor(rect: Rectangle) {
        super(rect);
    }
    
    makeCommandList(): void {
        this.addCommand(TextManager.item, "item", true, undefined);
        //this.addCommand(tr2("その他"), "other", true, undefined);

        if (MRLively.camera.currentMap.floorId().isSafetyMap()) {
            this.addCommand(DTextManager.save, "save", true, undefined);
        }
        else {
            this.addCommand(tr2("足元"), "feet", true, undefined);
            if (paramSuspendMenuEnabled) {
                this.addCommand(tr2("中断"), "suspend", true, undefined);
            }
        }

        this.height = this.fittingHeight(this.maxItems());
    }
}

