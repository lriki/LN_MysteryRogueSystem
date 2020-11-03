import { assert } from "ts/Common";
import { ActionId, REData } from "ts/data/REData";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { REDialogVisualWindowLayer } from "../REDialogVisual";
import { Window_ActionCommand } from "../windows/Window_ActionCommand";

export namespace RE {
    export class FootingDialogVisual extends REDialogVisualWindowLayer {
        _targetEntity: REGame_Entity;
        _actions: ActionId[];
        _entityNameWindow: Window_Help | undefined;
        _commandWindow: Window_ActionCommand | undefined;

        constructor(targetEntity: REGame_Entity, actions: ActionId[]) {
            super();
            this._targetEntity = targetEntity;
            this._actions = actions;
        }
        
        onCreate() {
            const y = 100;
            const cw = 200;

            console.log("FootingDialogVisual.onCreate");
            this._entityNameWindow = new Window_Help(new Rectangle(0, y, Graphics.boxWidth - cw, 100));
            this._entityNameWindow.setText("階段");
            this.addWindow(this._entityNameWindow);

            this._commandWindow = new Window_ActionCommand(new Rectangle(Graphics.boxWidth - cw, y, 200, 200), this._actions);
            this._actions.forEach((x, i) => {
                this._commandWindow?.setHandler(`index:${i}`, () => this.doAction(i));
            });
            this._commandWindow.setHandler("cancel", () => this.pop());
            this.addWindow(this._commandWindow);
    
        }

        private doAction(index: number) {
            const entity = this.dialogContext().causeEntity();
            assert(entity);

            this.commandContext().postAction(this._actions[index], entity, this._targetEntity);
            this.doneDialog(true);
        }
    }
}
