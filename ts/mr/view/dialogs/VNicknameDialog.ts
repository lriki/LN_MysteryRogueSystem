import { VDialog } from "./VDialog";
import { VWindowHelper } from "../windows/VWindowHelper";
import { SNicknameDialog } from "ts/mr/system/dialogs/SNicknameDialog";
import { VNicknameEditWindow } from "../windows/VNicknameEditWindow";
import { VNicknameInputWindow } from "../windows/VNicknameInputWindow";

/**
 * 未識別アイテムの名前付け
 */
export class VNicknameDialog extends VDialog {
    _model: SNicknameDialog;
    _editWindow: VNicknameEditWindow;
    _inputWindow: VNicknameInputWindow;

    constructor(model: SNicknameDialog) {
        super(model);
        this._model = model;

        // createEditWindow
        {
            const rect = this.editWindowRect();
            this._editWindow = new VNicknameEditWindow(rect);
            this._editWindow.setupFromEntity(this._model.item);
            this.addWindow(this._editWindow);
        }

        // createInputWindow
        {
            const rect = this.inputWindowRect();
            this._inputWindow = new Window_NameInput(rect);
            this._inputWindow.setEditWindow(this._editWindow);
            this._inputWindow.setHandler("ok", () => this.handleInputOk());
            this.addWindow(this._inputWindow);
        }
    }

    private editWindowRect(): Rectangle {
        const inputWindowHeight = VWindowHelper.calcWindowHeight(9, true);
        const padding = $gameSystem.windowPadding();
        const ww = 600;
        const wh = ImageManager.faceHeight + padding * 2;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
        return new Rectangle(wx, wy, ww, wh);
    }
    
    private inputWindowRect(): Rectangle {
        const wx = this._editWindow.x;
        const wy = this._editWindow.y + this._editWindow.height + 8;
        const ww = this._editWindow.width;
        const wh = VWindowHelper.calcWindowHeight(9, true);
        return new Rectangle(wx, wy, ww, wh);
    }

    private handleInputOk(): void {
        // コアスクリプトが定義する name() が、 PIXI.Container.name と競合するので、any で回避する。
        const name = (this._editWindow as any).name();
        this._model.setNickname(name);
        this.submit();
    }
}
