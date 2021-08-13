import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { SDialog } from "ts/system/SDialog";
import { SDialogContext } from "ts/system/SDialogContext";


export class SCommandPlaybackDialog extends SDialog {
    
    isVisualIntegration(): boolean {
        return false;
    }

    onUpdate(context: SDialogContext): void {
        assert(REGame.recorder.isPlayback());


        if (!REGame.recorder.runPlaybackCommand(this)) {
            REGame.recorder.restartRecording();
        }

        this.submit();
    }
}
