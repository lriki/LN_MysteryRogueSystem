
import { RE } from "ts/dialogs/EventExecutionDialog";
import { REDialogContext } from "ts/system/REDialog";
import { REDialogVisualWindowLayer } from "../REDialogVisual";

export class REEventExecutionDialogVisual extends REDialogVisualWindowLayer {
    onCreate() {
        const model = (this.dialogContext().dialog() as RE.EventExecutionDialog);
        const event = $gameMap.event(model.rmmzEventId());
        event.start();
        console.log("REEventExecutionDialogVisual start");
    }

    onUpdate(context: REDialogContext) {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            console.log("REEventExecutionDialogVisual doneDialog");
            this.doneDialog(true);
        }
    }
}
