import { registerExtensions } from "ts/extensions";
import { REData } from "../data/REData";

var _Scene_Title_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function() {
    _Scene_Title_start.call(this);
    registerExtensions();
    REData.ext.onDatabaseLoaded();
}
