import { assert } from "ts/mr/Common";
import { MRLively } from "ts/mr/lively/MRLively";
import { SDialog } from "ts/mr/system/SDialog";
import { SDialogContext } from "ts/mr/system/SDialogContext";

/**
 * Playback 中に他の Dialog の代用となる特殊な Dialog.
 */
export class SActivityPlaybackDialog extends SDialog {
    
    isVisualIntegration(): boolean {
        return false;
    }

    onUpdate(context: SDialogContext): void {
        assert(MRLively.recorder.isPlayback());


        if (!MRLively.recorder.runPlaybackCommand(this)) {
            MRLively.recorder.restartRecording();
        }

        this.submit();
    }
}
