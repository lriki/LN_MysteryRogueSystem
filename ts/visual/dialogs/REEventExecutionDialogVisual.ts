import { assert } from "ts/Common";
import { ActionId, REData } from "ts/data/REData";
import { RE } from "ts/dialogs/EventExecutionDialog";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { REDialogContext } from "ts/system/REDialog";
import { REDialogVisualWindowLayer } from "../REDialogVisual";

export class REEventExecutionDialogVisual extends REDialogVisualWindowLayer {
    onCreate() {
        console.log("REEventExecutionDialogVisual.onCreate");
        const model = (this.dialogContext().dialog() as RE.EventExecutionDialog);
        const event = $gameMap.event(model.rmmzEventId());
        event.start();
    }

    onUpdate(context: REDialogContext) {
        console.log("REEventExecutionDialogVisual.onUpdate");
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            this.doneDialog(true);
        }
    }
}
