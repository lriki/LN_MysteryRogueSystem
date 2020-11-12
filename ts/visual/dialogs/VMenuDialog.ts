import { assert } from "ts/Common";
import { ActionId, REData } from "ts/data/REData";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { Window_ActionCommand } from "../windows/Window_ActionCommand";
import { Window_Location } from "../windows/Window_Location";

export namespace RE {
    export class VMenuDialog extends REDialogVisualWindowLayer {
        _targetEntity: REGame_Entity;
        _locationWindow: Window_Location | undefined;

        constructor(targetEntity: REGame_Entity) {
            super();
            this._targetEntity = targetEntity;
        }
        
        onCreate() {


            const y = 100;
            const cw = 200;
            this._locationWindow = new Window_Location(new Rectangle(Graphics.boxWidth - cw, y, 200, 200));
            this.addWindow(this._locationWindow);
    
        }

    }
}
