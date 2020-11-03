import { REDialog, REDialogContext } from "ts/system/REDialog";

export namespace RE {

    export class EventExecutionDialog extends REDialog {
        private _rmmzEventId: number;

        constructor(rmmzEventId: number) {
            super();
            this._rmmzEventId = rmmzEventId;
        }

        rmmzEventId(): number {
            return this._rmmzEventId;
        }

        onUpdate(context: REDialogContext): void {
        }
    }

}
