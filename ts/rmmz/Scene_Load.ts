import { RESystem } from "ts/system/RESystem";
import { REGame } from "../objects/REGame";

const _Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
    _Scene_Load_onLoadSuccess.call(this);

    REGame.recorder.startPlayback();
}
