import { REGame } from "ts/objects/REGame";
import { VMessageLogWindow } from "./windows/VMessageLogWindow";
import { VMessageWindow } from "./windows/VMessageWindow";


/**
 * Scene_Message 相当の機能
 */
export class VMessageWindowSet {

    private _scene: Scene_Map;
    private _logWindow: VMessageLogWindow;
    private _messageWindow: VMessageWindow;

    constructor(scene: Scene_Map) {
        this._scene = scene;
        this._logWindow = new VMessageLogWindow(REGame.messageHistory, this.messageWindowRect());
        this._messageWindow = new VMessageWindow(REGame.message, this.messageWindowRect());
        this._scene.addWindow(this._logWindow);
        this._scene.addWindow(this._messageWindow);
    }

    private calcWindowHeight(numLines: number, selectable: boolean) {
        if (selectable) {
            return Window_Selectable.prototype.fittingHeight(numLines);
        } else {
            return Window_Base.prototype.fittingHeight(numLines);
        }
    }

    private messageWindowRect(): Rectangle {
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(3, false) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    }
    
}

