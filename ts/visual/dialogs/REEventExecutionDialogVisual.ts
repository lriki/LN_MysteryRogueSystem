
import { REEventExecutionDialog } from "ts/dialogs/EventExecutionDialog";
import { VDialog } from "./VDialog";

export class REEventExecutionDialogVisual extends VDialog {
    private _model: REEventExecutionDialog;

    constructor(model: REEventExecutionDialog) {
        super();
        this._model = model;
    }

    onCreate() {
        const event = $gameMap.event(this._model.rmmzEventId());
        event.start();
    }

    onUpdate() {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            this._model.consumeAction();
            this._model.submit();
        }
    }
}
