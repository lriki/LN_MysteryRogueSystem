import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { SDialog } from "ts/system/SDialog";
import { SDialogContext } from "ts/system/SDialogContext";

/**
 * Playback 中に他の Dialog の代用となる特殊な Dialog.
 */
export class SActivityPlaybackDialog extends SDialog {
    
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
