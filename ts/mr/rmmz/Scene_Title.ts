import { registerExtensions } from "ts/extensions";
import { MRData } from "../data/MRData";

var _Scene_Title_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
    _Scene_Title_start.call(this);
    registerExtensions();
    MRData.ext.onDatabaseLoaded();
}
