import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { REDialog, REDialogContext } from "ts/system/REDialog";
import { RESystem } from "ts/system/RESystem";


export class LCommandPlaybackDialog extends REDialog {
    
    isVisualIntegration(): boolean {
        return false;
    }

    onUpdate(context: REDialogContext): void {
        console.log("LCommandPlaybackDialog update");
        assert(REGame.recorder.isPlayback());
        REGame.recorder.runPlaybackCommand(this);
    }
}
