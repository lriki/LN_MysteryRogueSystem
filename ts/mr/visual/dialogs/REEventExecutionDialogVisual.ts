
import { assert } from "ts/mr/Common";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { VDialog } from "./VDialog";

export class REEventExecutionDialogVisual extends VDialog {
    private _model: SEventExecutionDialog;

    constructor(model: SEventExecutionDialog) {
        super(model);
        this._model = model;
    }

    onCreate() {
        const event = $gameMap.event(this._model.rmmzEventId());
        console.log("REEventExecutionDialogVisual", event);
        console.log("event.page()", event.page());
        
        event.start();
    }

    onUpdate() {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            const entity = this.dialogContext().causeEntity();
            assert(entity);
            //this.dialogContext().postActivity(LActivity.make(entity));
            this.submit();
        }
    }
}
