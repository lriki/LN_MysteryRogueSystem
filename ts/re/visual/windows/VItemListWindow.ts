import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";



/**
 */
export class VItemListWindow extends Window_Selectable {
    private _inventory: LInventoryBehavior | undefined;;
    private _equipmentUser: LEquipmentUserBehavior | undefined;
    private _entities: LEntity[];

    constructor(rect: Rectangle) {
        super(rect);
        this._entities = [];
    }

    public setInventory(inventory: LInventoryBehavior): void {
        this._inventory = inventory;
        this._entities = inventory.entities();
        this.refresh();
    }

    public setEquipmentUser(equipmentUser: LEquipmentUserBehavior): void {
        this._equipmentUser = equipmentUser;
    }
    
    selectedItem(): LEntity {
        return this.itemAt(this.index());
    }

    selectedItems(): [LEntity] {
        return [this.itemAt(this.index())];
    }

    // override
    maxCols(): number {
        return 1;
    }

    // override
    maxItems(): number {
        return this._entities.length;
    }
    
    // override
    isCurrentItemEnabled(): boolean {
        return true;
    }

    // override
    refresh(): void {
        this.makeItemList();
        super.refresh();
    }
    
    // override
    drawAllItems(): void {
        if (this.maxItems() <= 0) {
            this.drawText("なにも持っていない", 0, 0, 300, "left");
        }
        else {
            super.drawAllItems();
        }
    }

    // override
    drawItem(index: number): void {
        const item = this.itemAt(index);
        if (item) {
            const numberWidth = this.numberWidth();
            const rect = this.itemLineRect(index);
            this.changePaintOpacity(this.isEnabled(item));
            this.drawEntityItemName(item, rect.x, rect.y, rect.width - numberWidth);
            //this.drawItemNumber(item, rect.x, rect.y, rect.width);
            this.changePaintOpacity(true);
        }
    };

    private isEnabled(item: LEntity): boolean {
        return true;
    }
    
    private numberWidth(): number {
        return this.textWidth("000");
    }

    private itemAt(index: number): LEntity {
        return this._entities[index];
    }

    private makeItemList(): void {
    }
    
    private drawEntityItemName(item: LEntity, x: number, y: number, width: number): void {
        if (item) {
            const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
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
                this.resetTextColor();

                this.drawTextEx(desc, nameX, y, itemWidth);

                // 装備していればアイコンを表示する
                if (this._equipmentUser && this._equipmentUser.isEquipped(item)) {
                    this.drawIcon(12, nameX, iconY);
                }
            }

            // 値札
            if (0) {
                const data = item.data();
                const text = data.sellingPrice.toString();
                const tw = this.textWidth(text) + 8;
                const size = this.textSizeEx(text);
                const th = size.height - 4;
                const ty = y + (this.lineHeight() - th) / 2;
                const tx = width - tw + 4;
                this.changeTextColor(ColorManager.textColor(29));
                this.drawRect(tx, ty, tw, th);
                this.drawTextEx(text, width - tw, ty, tw);
            }
        }
    }


}

