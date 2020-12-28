import { LInventoryBehavior } from "ts/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { isThisTypeNode } from "typescript";



/**
 */
export class VItemListWindow extends Window_Selectable {
    private _inventory: LInventoryBehavior;
    private _entities: REGame_Entity[];

    constructor(inventory: LInventoryBehavior, rect: Rectangle) {
        super(rect);
        this._inventory = inventory;
        this._entities = inventory.entities();
        this.refresh();
    }
    
    selectedItems(): [REGame_Entity] {
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

    private isEnabled(item: REGame_Entity): boolean {
        return true;
    }
    
    private numberWidth(): number {
        return this.textWidth("000");
    }

    private itemAt(index: number): REGame_Entity {
        return this._entities[index];
    }

    private makeItemList(): void {
    }
    
    private drawEntityItemName(item: REGame_Entity, x: number, y: number, width: number): void {
        if (item) {
            const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
            const textMargin = ImageManager.iconWidth + 4;
            const itemWidth = Math.max(0, width - textMargin);
            this.resetTextColor();
            //this.drawIcon(item.iconIndex, x, iconY);
            //this.drawIcon(176, x, iconY);
            //this.drawText("おにぎり", x + textMargin, y, itemWidth, "left");
            this.drawTextEx(REGame.identifyer.makeDisplayText(item), x, y, itemWidth);
        }
    }


}

