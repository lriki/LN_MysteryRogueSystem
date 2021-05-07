
import { REEventExecutionDialog } from "ts/dialogs/EventExecutionDialog";
import { RESystem } from "ts/system/RESystem";
import { VDialog } from "./VDialog";

export class REEventExecutionDialogVisual extends VDialog {
    onCreate() {
        const model = (RESystem.dialogContext.dialog() as REEventExecutionDialog);
        const event = $gameMap.event(model.rmmzEventId());
        event.start();
    }

    onUpdate() {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            this.doneDialog(true);
        }
    }
}
