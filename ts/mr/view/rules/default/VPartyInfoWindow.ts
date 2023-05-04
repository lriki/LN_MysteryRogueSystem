import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { VFontHelper } from "../../utils/VFontHelper";
import { VLayoutDef } from "./VDefaultRule";

export class VPartyInfoWindow extends Window_StatusBase {

    constructor(rect: Rectangle) {
        super(rect);
        this.frameVisible = false;
        this.openness = 255;
        this.backOpacity = 0;
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
        // if ($gameTemp.isBattleRefreshRequested()) {
        //     this.refresh();
        // }
    }

    override refresh() {
        super.refresh();
        this.contents.clear();
        
        if (MRLively.mapView.currentMap.floorId().isTacticsMap2) {
            this.drawFloorNumber(
                VLayoutDef.FloorFieldX,
                VLayoutDef.FloorFieldY,
                VLayoutDef.FloorFieldWidth,
                VLayoutDef.FloorFieldHeight,
                MRLively.mapView.currentMap.floorId());
        }
        
        const entity = MRLively.mapView.focusedEntity();
        if (!entity) return;
        const inventory = entity.findEntityBehavior(LInventoryBehavior);
        if (!inventory) return;
        this.drawGold(
            VLayoutDef.GoldFieldX,
            VLayoutDef.GoldFieldY,
            VLayoutDef.GoldFieldWidth,
            this.lineHeight(),
            inventory.gold());
    }

    private drawFloorNumber(x: number, y: number, width: number, height: number, floorId: LFloorId): void {
        const value = floorId.floorNumber;
        const unit = "Ｆ";

        this.changeTextColor(ColorManager.normalColor());
        this.contents.fontSize = $gameSystem.mainFontSize() + 16;
        const [w1, h1] = VFontHelper.measureTextSize(this.contents, value.toString());
        this.drawText(value, x, y + height - h1, w1, "left");
        
        this.changeTextColor(ColorManager.systemColor());
        this.contents.fontSize = $gameSystem.mainFontSize();
        const [w2, h2] = VFontHelper.measureTextSize(this.contents, unit);
        this.drawText(unit, x + w1 + 2, y + height - h2 - 2, w2, "left");
    }

    private drawGold(x: number, y: number, width: number, height: number, gold: number): void {
        this.drawCurrencyValue(gold, this.currencyUnit(), x, y, width);
    }

    private currencyUnit(): string {
        return TextManager.currencyUnit;
    }
}
