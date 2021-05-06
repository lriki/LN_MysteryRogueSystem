import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { REDialog } from "ts/system/REDialog";
import { SDialogContext } from "ts/system/SDialogContext";


export class LCommandPlaybackDialog extends REDialog {
    
    isVisualIntegration(): boolean {
        return false;
    }

    onUpdate(context: SDialogContext): void {
        console.log("LCommandPlaybackDialog update");
        assert(REGame.recorder.isPlayback());
        REGame.recorder.runPlaybackCommand(this);
    }
}
