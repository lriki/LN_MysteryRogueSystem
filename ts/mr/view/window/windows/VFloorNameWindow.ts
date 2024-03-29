import { MRLively } from "ts/mr/lively/MRLively";

/**
 */
export class VFloorNameWindow extends Window_Base {
    private _showCount: number = 0;

    constructor(rect: Rectangle) {
        super(rect);
        this.openness = 0;
        this.opacity = 0;
        this.contentsOpacity = 0;
        this._showCount = 0;

        

    }
    
    public open() {
        this.refresh();
        this.openness = 255;
        this._showCount = 150;
    }
    
    public close() {
        this._showCount = 0;
        this.openness = 0;
    }

    public isEffectRunning(): boolean {
        return this._showCount > 0;
    }

    public showCount(): number {
        return this._showCount;
    }

    update() {
        Window_Base.prototype.update.call(this);
        if (this._showCount > 0 && $gameMap.isNameDisplayEnabled()) {
            this.updateFadeIn();
            this._showCount--;
        } else {
            this.updateFadeOut();
        }
    }
    
    private updateFadeIn() {
        this.contentsOpacity += 16;
    }
    
    private updateFadeOut() {
        this.contentsOpacity -= 16;
        if (this.contentsOpacity <= 0) {
            this.close();
        }
    }
    
    private refresh() {
        this.contents.clear();
        if ($gameMap.displayName()) {

            const floorId = MRLively.mapView.currentMap.floorId();
            const floorInfo = floorId.floorInfo;

            const displayName = floorInfo.displayName ? floorInfo.displayName : $gameMap.displayName();

            const lines = displayName.format(floorId.floorNumber).split("\\n");

            const height = this.lineHeight() * lines.length;

            const y = (this.innerHeight - height) / 2;
            
            const margin = 10;
            const width = this.innerWidth;
            this.drawBackground(0, y - margin, width, height + margin * 2);

            for (let i = 0; i < lines.length; i++) {
                this.drawText(lines[i], 0, y + i * this.lineHeight(), width, "center");
            }
        }
    }
    
    private drawBackground(x: number, y: number, width: number, height: number) {
        const color1 = ColorManager.dimColor1();
        const color2 = ColorManager.dimColor2();
        const half = width / 2;
        this.contents.gradientFillRect(x, y, half, height, color2, color1, false);
        this.contents.gradientFillRect(x + half, y, half, height, color1, color2, false);
    }
    
}

