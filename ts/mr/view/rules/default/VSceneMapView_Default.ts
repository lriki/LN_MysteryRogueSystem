import { MRLively } from "ts/mr/lively/MRLively";
import { VMessageLogWindow } from "../../window/windows/VMessageLogWindow";
import { VWindowHelper } from "../../window/VWindowHelper";
import { VSceneMapView } from "../VSceneMapView";
import { VLayoutDef } from "./VDefaultRule";
import { VPartyInfoWindow } from "./VPartyInfoWindow";
import { VPlayerStatusWindow2 } from "./VPartyStatusWindow";

export class VSceneMapView_Default extends VSceneMapView {
    private _logWindow: VMessageLogWindow;
    private _partyInfoWindow: VPartyInfoWindow;
    private _partyStatusWindow: VPlayerStatusWindow2;

    public constructor(scene: Scene_Map) {
        super(scene);

        this._partyInfoWindow = new VPartyInfoWindow(this.partyInfoWindowRect());
        this._partyInfoWindow._isWindow = false;
        this.scene._windowLayer.addChildAt(this._partyInfoWindow, 0);

        this._logWindow = new VMessageLogWindow(MRLively.messageHistory, this.messageWindowRect());
        this._logWindow.textPaddingX = VLayoutDef.MessageAreaX;
        this._logWindow.lineWidth = VLayoutDef.MessageAreaWidth;
        this._logWindow.setBackgroundType(1);
        this._logWindow._isWindow = false;
        this.scene._windowLayer.addChildAt(this._logWindow, 0);

        this._partyStatusWindow = new VPlayerStatusWindow2();
        this._partyStatusWindow._isWindow = false;
        //this.scene._windowLayer.addChildAt(this._partyStatusWindow, 0);
        this.scene.addWindow(this._partyStatusWindow);
        this._partyStatusWindow.show();
    }

    override update(): void {
    }

    private partyInfoWindowRect(): Rectangle {
        // 画面全体を覆うとツクールデフォルトの MessageWindow などが見えなくなってしまう
        return new Rectangle(0, 0, Graphics.boxWidth, VLayoutDef.PartyInfoWindowHeight);
    }

    private messageWindowRect(): Rectangle {
        const ww = Graphics.boxWidth;
        const wh = VWindowHelper.calcWindowHeight(2, false) + 8;
        const wx = 0;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    }
}

