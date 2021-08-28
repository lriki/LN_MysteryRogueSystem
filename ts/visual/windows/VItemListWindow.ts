import { LEquipmentUserBehavior } from "ts/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { isThisTypeNode } from "typescript";
import { UName } from "ts/usecases/UName";



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
        }
    }


}

