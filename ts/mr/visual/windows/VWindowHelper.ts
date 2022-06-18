import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { LItemBehavior } from "ts/mr/objects/behaviors/LItemBehavior";
import { LEntity } from "ts/mr/objects/LEntity";
import { UName } from "ts/mr/usecases/UName";

export class VWindowHelper {
    public static DefaultPadding = 12;
    public static LineHeight = 36;  // Window_Base.prototype.lineHeight

    public static calcWindowHeight(numLines: number, selectable: boolean) {
        if (selectable) {
            return Window_Selectable.prototype.fittingHeight(numLines);
        } else {
            return Window_Base.prototype.fittingHeight(numLines);
        }
    }

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
                const price = item.queryPrice();
                const text = price.sellingPrice.toString();
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
