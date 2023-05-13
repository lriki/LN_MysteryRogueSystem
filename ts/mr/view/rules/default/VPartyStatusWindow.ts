
const gaugeHeight = 6;

export class VPlayerStatusWindow2 extends Window_BattleStatus {
    static readonly HeaderHeight = 70;

    constructor() {
        super(new Rectangle(0, Graphics.boxHeight - 160, Graphics.boxWidth, 160)); // 画面全体を覆うとツクールデフォルトの MessageWindow などが見えなくなってしまう
        //this.frameVisible = true;
        this.frameVisible = false;
        this.openness = 255;
        this.backOpacity = 0;
        //this.visible = false;
        this.refresh();
    }

    override itemWidth() {
        return Math.floor(this.innerWidth / 5);
    }

    override itemRect(index: number) {
        const maxCols = this.maxCols();
        const itemHeight = this.itemHeight();
        const colSpacing = this.colSpacing();
        const rowSpacing = this.rowSpacing();
        const col = index % maxCols;
        const row = Math.floor(index / maxCols);
        const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
        const height = itemHeight - rowSpacing;

        const unitWidth = this.itemWidth();

        if (index == 0) {
            const itemWidth = unitWidth * 2;
            const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
            const width = itemWidth - colSpacing;
            return new Rectangle(x, y, width, height);
        }
        else {
            const upperMargin = 32;
            const itemWidth = unitWidth;
            const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
            const width = itemWidth - colSpacing;
            return new Rectangle(unitWidth + x, y + upperMargin, width, height - upperMargin);
        }
    }

    override update() {
        super.update();
        this.refresh();
    }

    override refresh() {
        super.refresh();
        // this.contents.clear();

        // this.placeBasicGauges($gameParty.members()[0], 0, 0);
    }

    // update() {
    //     // this.refresh();

    //     // if (MRLively.mapView.currentMap.floorId().isTacticsMap2 || MRLively.mapView.currentMap.floorId().isSafetyMap2) {
    //     //     this.visible = true;
    //     // }
    //     // else {
    //     //     this.visible = false;
    //     // }

    //     // this._levelLabel.update();
    //     // this._floorLabel.update();
    // }


    override nameX(rect: any): number {
        return rect.x + rect.width - 132;
        // 128: Sprite_Gauge.prototype.bitmapWidth
    };

    override basicGaugesX(rect: any): number {
        return rect.x + rect.width - 132;
        // 128: Sprite_Gauge.prototype.bitmapWidth
    }

    override drawBackgroundRect(rect: any): void {
        const c1 = "rgba(1, 0, 0, 0.0)";//ColorManager.itemBackColor1();
        const c2 = ColorManager.itemBackColor2();
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;
        this.contentsBack.gradientFillRect(x, y, w, h, c1, c2, true);
        //this.contentsBack.strokeRect(x, y, w, h, c1);
    }

    override drawItemImage(index: number): void {
        if (index != 0) return;
        const actor = this.actor(index);
        const rect = this.itemRect(index);
        const width = ImageManager.faceWidth;
        const height = ImageManager.faceHeight;
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 1, rect.y + rect.height - height - 1, width, height);
        this.changePaintOpacity(true);
    }

    override drawItemStatus(index: number): void {
        const actor = this.actor(index);
        const rect = this.itemRectWithPadding(index);
        const nameX = this.nameX(rect);
        const nameY = this.nameY(rect);
        const stateIconX = this.stateIconX(rect);
        const stateIconY = this.stateIconY(rect);
        const basicGaugesX = this.basicGaugesX(rect);
        const basicGaugesY = this.basicGaugesY(rect);
        this.placeTimeGauge(actor, nameX, nameY);
        this.placeActorName(actor, nameX, nameY);
        this.placeStateIcon(actor, stateIconX, stateIconY);
        this.placeBasicGauges(actor, basicGaugesX, basicGaugesY);

        if (index == 0) {
            const itemRect = this.itemRect(index);
            const containerWidth = ImageManager.faceWidth / 2;
            const containerHeight = 36;
            const padding = 2;
            const y = itemRect.y + itemRect.height - containerHeight - padding;
            const gaugeWidth = containerWidth - padding * 2;

            this.contents.fillRect(
                itemRect.x,
                y,
                ImageManager.faceWidth + 1,
                containerHeight,
                this.faceOverrayGaugeBackground());
            // this.contents.gradientFillRect(
            //     itemRect.x,
            //     y,
            //     ImageManager.faceWidth + 1,
            //     containerHeight,
            //     "rgba(1, 0, 0, 0.0)",
            //     this.faceOverrayGaugeBackground(),
            //     true);

    

            this.drawSmallGauge(
                itemRect.x + padding + 2,
                y - 2,
                gaugeWidth,
                TextManager.levelA,
                "15",
                0.2,
                this.expGugeColor());
            this.drawSmallGauge(
                itemRect.x + containerWidth + padding + 1, 
                y - 2,
                gaugeWidth,
                "FP",
                "100",
                0.9,
                this.fpGaugeColor());
        }
    }



    private drawSmallGauge(x: number, y: number, width: number, label: string, value: string, expRatio: number, gaugeColor: string): void {
        const t1 = label;
        const t2 = value;
        const w1 = this.textWidth(t1);

        // Text
        this.setupLabelFont(this.contents);
        this.drawText(t1, x, y, w1, "left");
        this.setupValueFont(this.contents);
        this.drawText(t2, x + 2 + w1, y, width - w1, "left");

        // Gauge
        this.contents.fillRect(x, y + this.gaugeY(), width, gaugeHeight, ColorManager.gaugeBackColor());
        this.contents.fillRect(x + 1, y + this.gaugeY() + 1, width * expRatio - 2, gaugeHeight - 2, gaugeColor);
    }

    private gaugeY(): number {
        return 30;
    }

    // Sprite_Gauge.prototype.setupLabelFont
    private setupLabelFont(bitmap: Bitmap) {
        bitmap.fontFace = this.labelFontFace();
        bitmap.fontSize = this.labelFontSize();
        bitmap.textColor = this.labelColor();
        bitmap.outlineColor = this.labelOutlineColor();
        bitmap.outlineWidth = this.labelOutlineWidth();
    }
    
    // Sprite_Gauge.prototype.labelFontFace
    private labelFontFace(): string {
        return $gameSystem.mainFontFace();
    }
    
    // Sprite_Gauge.prototype.labelFontSize
    private labelFontSize(): number {
        return $gameSystem.mainFontSize() - 6;
    }
    
    // Sprite_Gauge.prototype.labelColor
    private labelColor(): string {
        return ColorManager.systemColor();
    };
    
    // Sprite_Gauge.prototype.labelOutlineColor
    private labelOutlineColor(): string {
        return ColorManager.outlineColor();
    };
    
    // Sprite_Gauge.prototype.labelOutlineWidth
    private labelOutlineWidth(): number {
        return 3;
    }
    
    // Sprite_Gauge.prototype.setupValueFont
    private setupValueFont(bitmap: Bitmap) {
        bitmap.fontFace = this.valueFontFace();
        bitmap.fontSize = this.valueFontSize();
        bitmap.textColor = this.valueColor();
        bitmap.outlineColor = this.valueOutlineColor();
        bitmap.outlineWidth = this.valueOutlineWidth();
    }

    // Sprite_Gauge.prototype.valueFontFace
    private valueFontFace(): string {
        return $gameSystem.numberFontFace();
    }
    
    // Sprite_Gauge.prototype.valueFontSize
        private valueFontSize(): number {
        return $gameSystem.mainFontSize() - 6;
    }

    // Sprite_Gauge.prototype.valueColor
    private valueColor(): string {
        return ColorManager.normalColor();
    }
    
    // Sprite_Gauge.prototype.valueOutlineColor
    private valueOutlineColor(): string {
        return "rgba(0, 0, 0, 1)";
    }
    
    // Sprite_Gauge.prototype.valueOutlineWidth
    private valueOutlineWidth(): number {
        return 2;
    }

    private faceOverrayGaugeBackground(): string {
        return "rgba(0, 0, 0, 0.3)";
    }

    private expGugeColor(): string {
        return ColorManager.hpGaugeColor2();
    }

    private fpGaugeColor(): string {
        return ColorManager.textColor(23);
    }
}
