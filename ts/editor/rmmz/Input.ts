import { EditorManager } from "../EditorManager";

const _Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event: any) {
    if (EditorManager.isPlaytest() && event.key == "F9") {
        EditorManager.toggle();
    }
    else {
        _Input_onKeyDown.call(this, event);
    }
}

