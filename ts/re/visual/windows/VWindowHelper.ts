import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";

export class VWindowHelper {
    public static DefaultPadding = 12;
    public static LineHeight = 36;  // Window_Base.prototype.lineHeight

    public static calcWindowSizeFromClinetSize(width: number, height: number): number[] {
        //const pad = this.calcOuterPadding(window);
        return [width + this.DefaultPadding * 2, height + this.DefaultPadding * 2];
    }

    public static calcOuterPadding(window: Window_Base): number[] {
        const pad = window.padding;
        return [
            pad - window.origin.x,
            pad - window.origin.y];
    }
    
    public static drawEntityItemName(window: Window_Base, item: LEntity, x: number, y: number, width: number, equipmentUser: LEquipmentUserBehavior | undefined): void {
        if (item) {
            const iconY = y + (window.lineHeight() - ImageManager.iconHeight) / 2;
            const nameX = x + ImageManager.iconWidth;
            const desc = UName.makeNameAsItem(item);

            // State Icon
            {
            }

            // Item Icon
            // Name
            {
                const textMargin = ImageManager.iconWidth * 2 + 4;

                const itemWidth = Math.max(0, width - textMargin);
                window.resetTextColor();

                window.drawTextEx(desc, nameX, y, itemWidth);

                // 装備していればアイコンを表示する
                if (equipmentUser && equipmentUser.isEquipped(item)) {
                    window.drawIcon(12, nameX, iconY);
                }
            }

            // 値札
            const itemBehavior = item.findEntityBehavior(LItemBehavior);
            if (itemBehavior && itemBehavior.shopStructureId() > 0) {
                const data = item.data();
                const text = data.sellingPrice.toString();
                const tw = window.textWidth(text) + 8;
                const size = window.textSizeEx(text);
                const th = size.height - 4;
                const ty = y + (window.lineHeight() - th) / 2;
                const tx = width - tw + 4;
                window.changeTextColor(ColorManager.textColor(29));
                window.drawRect(tx, ty, tw, th);
                window.drawTextEx(text, width - tw, ty, tw);
            }
        }
    }
}


export class VLayout {

    public static makeGridRect(gx: number, gy: number, gw: number, gh: number) {
        return new Rectangle(this.calcGridX(gx), this.calcGridY(gy), this.calcGridWidth(gw), this.calcGridHeight(gh));
    }
    
    public static calcGridWidth(xs: number): number {
        return xs * (Graphics.boxWidth / 12);
    }
    public static calcGridHeight(xs: number): number {
        return xs * (Graphics.boxHeight / 12);
    }

    public static calcGridX(xs: number): number {
        return xs * (Graphics.boxWidth / 12);
    }

    public static calcGridY(xs: number): number {
        return xs * (Graphics.boxHeight / 12);
    }
}
