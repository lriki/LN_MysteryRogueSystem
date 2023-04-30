import { VHelper } from "../VHelper";

export class VIconSprite extends Sprite {
    
    public constructor(bitmap?: Bitmap | undefined) {
        super(bitmap ?? ImageManager.loadSystem("IconSet"));
        this.setIcon(0);
    }

    public setIcon(iconIndex: number): void {
        VHelper.setIconFrame(this, iconIndex);
        if (iconIndex == 0)
            this.visible = false;
        else
            this.visible = true;
    }

}
