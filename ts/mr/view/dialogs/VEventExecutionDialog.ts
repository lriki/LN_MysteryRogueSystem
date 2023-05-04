
import { assert } from "ts/mr/Common";
import { DScript } from "ts/mr/data/DScript";
import { MRLively } from "ts/mr/lively/MRLively";
import { RmmzEventTriggerType } from "ts/mr/rmmz/Common";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { UMovement } from "ts/mr/utility/UMovement";
import { VDialog } from "./VDialog";

export class VEventExecutionDialog extends VDialog {
    public readonly model: SEventExecutionDialog;
    private _prelockDirection: number;

    constructor(model: SEventExecutionDialog) {
        super(model);
        this.model = model;
        this._prelockDirection = 0;
    }

    override onCreate() {
        let event = this.model.rmmzEvent;
        if (!event) {   // TODO: deprecated
            event = $gameMap.event(this.model.rmmzEventId());
        }

        // TODO: とりあえず、既存の階段イベントが動かなくなるので暫定処置。
        // callCommand() 方式に統一したい。
        const data = new DScript(event.list());
        if (MRLively.scriptManager.callCommand(this.model.owner, data, "MRCommand-OnTalk")) {
            
        }
        else {
            event.start();
        }

        // Game_Event.start() 相当の向き変更の実装
        if (event.list().length > 0) {
            if (event.isTriggerIn([RmmzEventTriggerType.Button, RmmzEventTriggerType.TouchFromPlayer, RmmzEventTriggerType.TouchFromEvent])) {
                this._prelockDirection = this.model.owner.dir;
                this.model.owner.dir = UMovement.getLookAtDir(this.model.owner, this.model.player);
            }
        }

    }

    override onUpdate() {
        // マップ遷移後にもイベント実行を続けることもあるので、
        // $gameMap.event() は参照せずに $gameMap.isEventRunning() で実行中かを判断する。
        if (!$gameMap.isEventRunning()) {
            const entity = this.dialogContext().causeEntity();
            assert(entity);
            this.submit();
            
            // Game_Event.unlock() 相当の向き変更の実装
            if (this._prelockDirection > 0) {
                this.model.owner.dir = this._prelockDirection;
            }
        }
    }
}
