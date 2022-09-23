import { REGame } from "../lively/REGame";

const _Scene_Save_executeSave = Scene_Save.prototype.executeSave;
Scene_Save.prototype.executeSave = function(savefileId: number) {
    _Scene_Save_executeSave.call(this, savefileId);
    REGame.recorder.setSavefileId(savefileId);
}
