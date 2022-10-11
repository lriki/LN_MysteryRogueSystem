import { MRLively } from "../lively/MRLively";

const _Scene_Save_executeSave = Scene_Save.prototype.executeSave;
Scene_Save.prototype.executeSave = function(savefileId: number) {
    _Scene_Save_executeSave.call(this, savefileId);
    MRLively.recorder.setSavefileId(savefileId);
}
