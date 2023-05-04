import { LEntity } from "ts/mr/lively/entity/LEntity";
import { VLayout } from "../ui/VUIElement";
import { VWindowHelper } from "./VWindowHelper";

export class VEntityCaptionWindow extends Window_Base {
    private _entity: LEntity;

    public static getDefaultRect(): Rectangle {
        const size = VWindowHelper.calcWindowSizeFromClinetSize(0, VWindowHelper.LineHeight);
        return new Rectangle(0, VLayout.calcGridY(3), VLayout.calcGridWidth(9), size[1]);
    }

    public constructor(entity: LEntity) {
        super(VEntityCaptionWindow.getDefaultRect());


        const pad = this.padding;
        //this._clientArea.move(pad, pad);
        const ax = pad - this.origin.x;
        const ay = pad - this.origin.y;


        this._entity = entity;
        this.refresh();
    }
    
    public setEntity(entity: LEntity): void {
        this._entity = entity;
        this.refresh();
    }

    public refresh(): void {
        const rect = this.baseTextRect();
        this.contents.clear();
        VWindowHelper.drawEntityItemName(this, this._entity, 0, 0, rect.width, undefined);
        //this.drawTextEx(this._text, rect.x, rect.y, rect.width);
    }
}
