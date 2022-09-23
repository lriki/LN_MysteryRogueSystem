import { VUIContainer } from "./VUIElement";



declare global {
    interface Window_Base {
        _root_RE: VUIContainer | undefined;
    }
}

const _Window_Base_update = Window_Base.prototype.update;
Window_Base.prototype.update = function() {
    
    _Window_Base_update.call(this);
}

