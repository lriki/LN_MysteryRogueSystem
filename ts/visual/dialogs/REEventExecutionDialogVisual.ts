
import { RE } from "ts/dialogs/EventExecutionDialog";
import { REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";
import { VSubDialog } from "./VSubDialog";

export class REEventExecutionDialogVisual extends VSubDialog {
    onCreate() {
        const model = (RESystem.dialogContext.dialog() as RE.EventExecutionDialog);
        const event = $gameMap.event(model.rmmzEventId());
        event.start();
    }

    onUpdate(context: REDialogContext) {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            this.doneDialog(true);
        }
    }
}
